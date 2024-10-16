import test, { expect } from "@playwright/test";
import { FULL_URL } from '../playwright.config';
import { Locators } from '../utils/locators';

const PREFIX = "quicware";
let generatedChangeRequestName: string;
let savedUrl: string;
let workScheduleId: string;

function generateChangeRequestName(): string {
    const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${PREFIX}-${randomNumber}-1`;
}

test.describe.serial('Workflow 1', () => {
    let locators: Locators;

    test.beforeAll(() => {
        generatedChangeRequestName = generateChangeRequestName();
        console.log(`Generated Change Request Name: ${generatedChangeRequestName}`);
    });

    test.beforeEach(async ({ page }) => {
        locators = new Locators(page);
        console.log('launch url',FULL_URL!);
        await page.goto(FULL_URL!);
        await page.waitForLoadState('networkidle');
    });

    test.afterEach(async ({ context }) => {
        await context.clearCookies();
    });

    test('Navigate to Salesforce and create Change Request', async ({ page }) => {
        await expect(locators.changeRequestsTab()).toBeVisible();
        await locators.changeRequestsTab().click();

        await expect(locators.specificColumnSequence()).toHaveCount(1);

        await locators.newButton().click();

        await expect(locators.modalHeader()).toBeVisible();
        await expect(locators.modalHeader()).toHaveText('New Change Request');

        await locators.changeRequestNameInput().fill(generatedChangeRequestName);

        await locators.searchSitesInput().fill('Training Site');
        await locators.searchSitesInput().press('Enter');

        await locators.trainingSiteOption().click();
        await locators.briefDescriptionInput().fill(`Example change request-${PREFIX}`);
        await locators.isTemplateCheckbox().click();

        await locators.riskClassificationDropdown().click();
        await locators.lowRiskOption().click();

        await locators.potentialImpactDropdown().click();
        await locators.lowImpactOption().click();

        await locators.justificationDropdown().click();
        await locators.maintenanceOption().click();

        await locators.saveButton().click();

        const toastText = await locators.toastMessage().innerText();
        expect(toastText).toContain('Example change request-quicware | TST');

        await expect(locators.changeRequestTitle()).toBeVisible();
        await expect(locators.changeRequestTitle()).toContainText('Example change request-quicware | TST');

        savedUrl = page.url();
        console.log('Saved URL:', savedUrl);
    });

    test('Create new associated Work Schedule', async ({ page }) => {
        expect(savedUrl).toBeDefined();
        await page.goto(savedUrl);
        await page.waitForLoadState('networkidle');

        await locators.newWorkScheduleButton().click();

        await locators.workScheduleStartDate().click();
        await locators.calendarTodayButton().click();

        await locators.selectWorkScheduleOption('1');
        await locators.setEveryYears('1');
        await locators.dayInput().fill('1');
        await locators.durationInput().fill('1');
        await locators.creationLeadTimeInput().fill('2');
        await locators.reminderLeadTimeInput().fill('2');

        await locators.workScheduleSaveButton().click();

        const toastText = await locators.toastMessage().innerText();
        expect(toastText).toContain('Record saved successfully');

        workScheduleId = await locators.getWorkScheduleId();
        console.log('Work Schedule Name:', workScheduleId);
    });
    test('Create and validate the report', async ({ page }, testInfo) => {
        testInfo.retry = 3;
        await locators.reportsTab().click();
        await locators.newReportButton().click();
        await page.waitForLoadState('networkidle');

        await expect(locators.createReportModalHeader()).toBeVisible();
        await expect(locators.createReportModalHeader()).toContainText('Create Report');

        const categoryList = locators.reportTypeCategoryList();
        console.log(`Number of report type categories: ${categoryList}`);
        await expect(categoryList).toHaveCount(7);
        await locators.searchReportTypes().fill('Work Schedules with Change Request');
        await locators.searchReportTypes().press('Enter');

        await locators.workSchedulesWithChangeRequestRow().click();
        await locators.startReportButton().click();

        await expect(locators.workSchedulesWithChangeRequestBadge()).toBeVisible();
        await locators.runReportButton().click();
        await locators.runReportButton().isHidden();

        const workScheduleIdExists = await locators.isWorkScheduleIdInReport(workScheduleId);
        await page.waitForLoadState('networkidle');
        expect(workScheduleIdExists).toBe(true);
        await expect(locators.workScheduleIdHeader()).toContainText(workScheduleId);
    });
});

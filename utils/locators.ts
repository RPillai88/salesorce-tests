import { expect, Page } from '@playwright/test';

export class Locators {
    constructor(private readonly page: Page) { }

    // Change Request page locators
    changeRequestsTab = () => this.page.locator('a[title="Change Requests"]');
    newButton = () => this.page.locator('a[role="button"][title="New"]');
    modalHeader = () => this.page.locator('h2:has-text("New Change Request")');
    changeRequestNameInput = () => this.page.locator('input[name="Name"]');
    searchSitesInput = () => this.page.locator('input[role="combobox"][placeholder="Search Sites..."]');
    changeRequestTitle = () => this.page.locator('slot[name="primaryField"].slds-page-header__title');

    // Table locators
    changeRequestsTable = () => this.page.locator('[aria-label="Change Requests"]');
    specificColumnSequence = () => this.page.locator('th[title="Work End"] + th[title="Status"] + th[title="Tracking #"]');

    // Form input locators
    trainingSiteOption = () => this.page.locator('lightning-base-combobox-item:has(lightning-base-combobox-formatted-text[title="Training Site"])');
    briefDescriptionInput = () => this.page.locator('input[name="CFIM__Brief_Description__c"]');
    isTemplateCheckbox = () => this.page.locator('input[name="CFIM__Is_Template__c"]');
    riskClassificationDropdown = () => this.page.locator('button[aria-label="Risk Classification"]');
    lowRiskOption = () => this.page.locator('lightning-base-combobox-item[data-value="Low Risk"]');
    potentialImpactDropdown = () => this.page.locator('button[aria-label="Potential Impact"]');
    lowImpactOption = () => this.page.locator('lightning-base-combobox-item[data-value="Level I - Low (No Impact is expected)"]');
    justificationDropdown = () => this.page.locator('button[aria-label="Justification"]');
    maintenanceOption = () => this.page.locator('lightning-base-combobox-item[data-value="Maintenance"]');
    saveButton = () => this.page.locator('button[name="SaveEdit"]');

    // Toast message
    toastMessage = () => this.page.locator('.toastMessage');

    // Work schedule locators and methods
    newWorkScheduleButton = () => this.page.locator('header:has-text("Work Schedule") button:has-text("New")');
    workScheduleStartDate = () => this.page.locator('input[name="CFIM__Start_Date__c"]');
    calendarPopup = () => this.page.locator('div.slds-datepicker');
    calendarTodayButton = () => this.calendarPopup().locator('button:has-text("Today")');
    workScheduleOptionRadio = (value: string) => this.page.locator(`input[type="radio"][name="_workSchedule.CFIM__Option__c"][value="${value}"]`);
    everyYearsInput = () => this.page.locator('input[name="CFIM__Every_Years__c"]:not([disabled])');
    dayInput = () => this.page.locator('input[name="CFIM__Day__c"]');
    durationInput = () => this.page.locator('input[name="CFIM__Duration__c"]');
    creationLeadTimeInput = () => this.page.locator('input[name="CFIM__Creation_Lead_Time_in_Days__c"]');
    reminderLeadTimeInput = () => this.page.locator('input[name="CFIM__Reminder_Lead_Time_in_Days__c"]');
    workScheduleSaveButton = () => this.page.locator('button[title="Save"]');

    async selectWorkScheduleOption(value: string) {
        const radioButton = this.workScheduleOptionRadio(value);
        await radioButton.waitFor({ state: 'visible' });
        await radioButton.check();
        await expect(radioButton).toBeChecked();
    }

    async setEveryYears(value: string) {
        const input = this.everyYearsInput();
        await input.waitFor({ state: 'visible' });
        await input.fill(value);
        await expect(input).toHaveValue(value);
    }

    // Work schedule table locators and methods
    workScheduleTable = () => this.page.locator('table[role="grid"]');
    workScheduleNameColumn = () => this.page.locator('thead tr th[aria-label="Name"][aria-sort]:visible');
    workScheduleAssignedToColumn = () => this.page.locator('thead tr th[aria-label="Assigned to"][aria-sort]:visible');
    workScheduleFrequencyColumn = () => this.page.locator('thead tr th[aria-label="Frequency"][aria-sort]:visible');
    workScheduleSummaryColumn = () => this.page.locator('thead tr th[aria-label="Summary"][aria-sort]:visible');
    workScheduleNameCell = () => this.page.locator('th[data-label="Name"][data-col-key-value="Name-text-1"]');

    async verifyWorkScheduleColumns() {
        await expect(this.workScheduleNameColumn()).toBeVisible();
        await expect(this.workScheduleAssignedToColumn()).toBeVisible();
        await expect(this.workScheduleFrequencyColumn()).toBeVisible();
        await expect(this.workScheduleSummaryColumn()).toBeVisible();
    }

    async getWorkScheduleId(): Promise<string> {
        const nameCell = this.workScheduleNameCell();
        await nameCell.waitFor({ state: 'visible' });
        return nameCell.innerText();
    }

    // Reports locators and methods
    reportsTab = () => this.page.locator('a[title="Reports"]');
    newReportButton = () => this.page.locator('a[title="New Report"]');
    getReportIframe = () => this.page.frameLocator('iframe[title="Report Builder"]');
    createReportModalHeader = () => this.getReportIframe().locator('#dialog-heading');
    reportTypeCategoryList = () => this.getReportIframe().locator('ul[role="listbox"] > li.slds-nav-vertical__item');
    reportTypeTableHeader = () => this.getReportIframe().locator('tr:has(th:has-text("Report Type Name"))');
    searchReportTypes = () => this.getReportIframe().locator('#modal-search-input');
    workSchedulesWithChangeRequestRow = () => this.getReportIframe().locator('tr.datarow.reportBuilder', {
        has: this.getReportIframe().locator('p.slds-truncate', { hasText: 'Work Schedules with Change Request' })
    });
    startReportButton = () => this.getReportIframe().locator('#start-report-btn');
    workSchedulesWithChangeRequestBadge = () => this.getReportIframe().locator('span.slds-badge.dash-tag', {
        hasText: 'Work Schedules with Change Request'
    });
    runReportButton = () => this.getReportIframe().locator('button.slds-button_brand.action-bar-action-runReport', { hasText: 'Run' });
    reportTableCells = () => this.getReportIframe().locator('td.data-grid-table-cell');


    workScheduleColumnHeader = () => this.getReportIframe().locator('div.wave-table-cell-measure-header span[title="Work Schedule: Info : Work Schedule: Schedule #"]');


    async isWorkScheduleIdInReport(workScheduleId: string): Promise<boolean> {
        // Wait for the report to load
        await this.page.waitForLoadState('networkidle');
        await this.workScheduleColumnHeader().nth(1).waitFor({ state: 'visible' });
        const headers = await this.workScheduleColumnHeader().all();
        if (headers.length < 2) {
            throw new Error('There is no second Work Schedule: Schedule # header');
        }
        await headers[1].click();
        await this.page.waitForLoadState('networkidle');
        await headers[1].click();
        await this.page.waitForTimeout(10000);
        await this.page.waitForLoadState('networkidle');

        await this.reportTableCells().first().waitFor({ state: 'visible', timeout: 10000 });

        const cells = this.reportTableCells();
        const allCells = await cells.all();
        console.log(`Total number of cells in the report: ${allCells.length}`);

        for (let i = 0; i < allCells.length; i++) {
            const cell = allCells[i];
            const cellText = await cell.innerText();
            console.log(`Cell ${i + 1} text: ${cellText}`);

            if (cellText.includes(workScheduleId)) {
                console.log(`Work Schedule ID found in report at cell ${i + 1}`);
                const link = cell.locator('a');
                if (await link.isVisible()) {
                    await link.click();
                } else {
                    console.log('Link not visible or not found in the cell');
                }
                return true;
            }
        }
        console.log(`Work Schedule ID not found: ${workScheduleId}`);
        return false;
    }

    workScheduleIdHeader = () => this.page.locator('h1 slot[name="primaryField"] lightning-formatted-text');

    async verifyWorkScheduleIdInHeader(workScheduleId: string): Promise<boolean> {
        const headerText = await this.workScheduleIdHeader().innerText();
        return headerText.includes(workScheduleId);
    }



}



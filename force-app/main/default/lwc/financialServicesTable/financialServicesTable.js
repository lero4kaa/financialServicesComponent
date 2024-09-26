import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAccounts from '@salesforce/apex/FinancialServicesCompController.getAccounts';
import updateAccounts from '@salesforce/apex/FinancialServicesCompController.updateAccounts';

import NAME_FIELD from "@salesforce/schema/Account.Name";

export default class FinancialServicesTable extends LightningElement {
    @track accounts = [];
    @track accountsResult;

    columns = [
        { label: 'Name', fieldName: 'nameLink', sortable: true, type: 'url', 
            typeAttributes: {label: { fieldName: 'Name' }, target: '_blank'}, editable : 'true', hideDefaultActions: true },
        { label: 'Owner', fieldName: 'ownerName', sortable: true, hideDefaultActions: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', editable : 'true', hideDefaultActions: true },
        { label: 'Website', fieldName: 'Website', type: 'url', editable : 'true', hideDefaultActions: true },
        { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency', editable : 'true', hideDefaultActions: true },
    ];

    isLoading = true;

    offsetNum = 0;
    limitNum = 10;
    searchName = null;
    sortField = null;
    sortDirection = null;
    sortColumn = null;
    nextSortDirection = 'asc';

    currTimeout = null;

    // get searchName() {
    //     return this._searchName;
    // }

    // set searchName(val) {
        
    //     this._searchName = this.searchName;
    // }


    @wire(getAccounts, {offsetNum: 0, limitNum: '$limitNum', searchName: '$searchName', 
        sortField: '$sortField', sortDirection: '$sortDirection'})
    wiredAccounts(result) {
        this.accountsResult = result;
        this.isLoading = false;
        if (this.accountsResult.data) {
            this.accounts = JSON.parse(JSON.stringify(this.accountsResult.data));
            this.accounts.forEach(acc => acc.nameLink = `/${acc.Id}`);
            this.accounts.forEach(acc => acc.ownerName = acc.Owner.Name);
        } else if (this.accountsResult.error) {
            console.error(this.accountsResult.error);
        }
    }

    handleSearchInput(event) {
        const newValue = event.target.value;
        
        window.clearTimeout(this.currTimeout);
        
        this.currTimeout = setTimeout(() => {
            this.initLoading();
            this.searchName = newValue;
        }, 1000);
    }

    handleSort(event) {
        this.initLoading();
        this.sortDirection = event.detail.sortDirection;
        this.sortColumn = event.detail.fieldName;
        if (this.sortColumn === 'nameLink') {
            this.sortField = 'Name';
        } else if (this.sortColumn === 'ownerName') {
            this.sortField = 'Owner.Name';
        }

        this.nextSortDirection = this.sortDirection;
   }

   handleLoadMore(event) {
    const e = event.target;

    e.isLoading = true;

    this.offsetNum += 10;

    getAccounts({offsetNum: this.offsetNum, limitNum: this.limitNum, searchName: this.searchName, 
        sortField: this.sortField, sortDirection: this.sortDirection})
        .then(data => {
            if (data) {
                const newAccounts = JSON.parse(JSON.stringify(data));
                newAccounts.forEach(acc => acc.nameLink = `/${acc.Id}`);
                newAccounts.forEach(acc => acc.ownerName = acc.Owner.Name);
                this.accounts = this.accounts.concat(newAccounts);
                if(newAccounts.length < 10) {
                    e.enableInfiniteLoading = false;
                }
            }
            e.isLoading = false;
            this.isLoading = false;
        }) 
        .catch(error => {
            console.error(error); 
        })
   }

    handleSave(event) {
        const drafts = event.detail.draftValues;
        updateAccounts({ accounts: drafts })
            .then(() => {
                refreshApex(this.accountsResult)
                    .then(() => {
                        this.template.querySelector("lightning-datatable").draftValues = [];
                    })
                    .catch((err) => {
                        this.showErrorToast('Couldn\'t refresh records. Please contact your admin. ' + err.body.message);
                        this.template.querySelector("lightning-datatable").draftValues = [];
                    })
                this.showSuccessToast('Records were successfuly updated');
            })
            .catch((err) => {
                this.showErrorToast('Records update failed. Please contact your admin. ' + err.body.message);
            })
    }

    showErrorToast(errorMessage) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: errorMessage,
            variant: 'error',
        }))
    }

    showSuccessToast(message) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success',
        }))
    }

    initLoading() {
        this.accounts = [];
        this.offsetNum = 0;
        this.isLoading = true;
        this.template.querySelector('lightning-datatable').enableInfiniteLoading = true;
    }
}
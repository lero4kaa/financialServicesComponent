@isTest
private class FinancialServicesCompControllerTest {
    @testSetup static void makeData() {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 20; i++) {
            Account acc = new Account();
            acc.Name = 'Test Account ' + i;
            acc.Industry = 'Financial Services';
            accounts.add(acc);
        }
        insert accounts;
    }

    @isTest static void getAccountsTest() {
        Integer offsetNum = 0;
        Integer limitNum = 5;
        String searchName = null;
        String sortField = null;
        String sortDirection = null;

        Test.startTest();
        List<Account> result = FinancialServicesCompController.getAccounts(offsetNum, limitNum, searchName,
            sortField, sortDirection);
        Test.stopTest();

        Assert.areEqual(limitNum, result.size());
    }

    @isTest static void getAccountsTestSearch() {
        Integer offsetNum = 0;
        Integer limitNum = 20;
        String searchName = 'Test Account 1';
        String sortField = null;
        String sortDirection = null;

        Test.startTest();
        List<Account> result = FinancialServicesCompController.getAccounts(offsetNum, limitNum, searchName,
            sortField, sortDirection);
        Test.stopTest();

        Assert.areEqual(11, result.size());
    }

    @isTest static void getAccountsTestSort() {
        Integer offsetNum = 0;
        Integer limitNum = 20;
        String searchName = null;
        String sortField = 'Name';
        String sortDirection = 'asc';

        Test.startTest();
        List<Account> result = FinancialServicesCompController.getAccounts(offsetNum, limitNum, searchName,
            sortField, sortDirection);
        Test.stopTest();

        Assert.areEqual('Test Account 10', result[2].Name);
    }

    @isTest static void updateAccountsTest() {
        Map<Id, Account> accsMap = new Map<Id, Account>([SELECT Name FROM Account Limit 10]);
        for (Account acc : accsMap.values()) {
            acc.Name = acc.Name + ' Updated';
        }

        Test.startTest();
        FinancialServicesCompController.updateAccounts(accsMap.values());
        Test.stopTest();

        List<Account> accsAfterUpdate = [SELECT Name FROM Account WHERE Name LIKE '% Updated'];
        Assert.areEqual(10, accsAfterUpdate.size());
    }
}
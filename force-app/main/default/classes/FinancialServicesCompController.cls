public with sharing class FinancialServicesCompController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(Integer offsetNum, Integer limitNum, String searchName,
        String sortField, String sortDirection) {
        try {
            String query = 'SELECT Name, Phone, Website, AnnualRevenue, Owner.Name ' +
                'FROM Account WHERE Industry = \'Financial Services\'';
            
            if (searchName != null) {
                searchName += '%';
                query += ' AND Name LIKE \'' + String.escapeSingleQuotes(searchName) + '\'';
            } 

            if (sortField != null) {
                query += ' ORDER BY ' + sortField + ' ' + sortDirection.toUpperCase();
            }

            query += ' LIMIT ' + limitNum + ' OFFSET ' + offsetNum;

            List<Account> accounts = Database.query(query, AccessLevel.USER_MODE); 
            return accounts;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void updateAccounts(List<Account> accounts){
        try {
            update as user accounts;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
# iOS Shortcuts

iOS shortcuts to add transactions and category transfers from your iOS device into your AspireBudget spreadsheet

![](./screenshots/add-transaction.jpg)
![](./screenshots/add-category-transfer.jpg)

Shortcuts links:
1. Add transactions: https://www.icloud.com/shortcuts/e1a22f09e5c6444d885c32168bfb0bfe
2. Add category transfers: https://www.icloud.com/shortcuts/2d200b821e6249f89fbdbdc17982b49a

## Setup steps

To make this work you'll need to create an Apps Scripts project inside your spreadsheet. The setup should take less than 15 minutes

1. Go to your Aspire Budget spreadsheet and click `Extensions` -> `Apps Script`. This will open an unnamed Apps Script project, unless you already had a project attached to the spreadsheet:

![](./screenshots/setup-step-1.png)

2. Give a name to the project, it could be the same name as the spreadsheet

![](./screenshots/setup-step-2.1.png)

![](./screenshots/setup-step-2.2.png)

3. Replace the content of the `Code.gs` file with the content of the script [Code.gs](./Code.gs), and click Save
4. Trigger the authorization setup by running the function `authorizationTrigger` manually (this function adds one dummy transaction, don't forget to delete it at the end):

![](./screenshots/setup-step-4.1.png)

![](./screenshots/setup-step-4.2.png)

![](./screenshots/setup-step-4.3.png)

5. Proceed until the authorization details, read it an click `Allow` if you agree:

![](./screenshots/setup-step-4.4.png)

![](./screenshots/setup-step-4.5.png)

![](./screenshots/setup-step-4.6.png)

![](./screenshots/setup-step-4.7.png)

6. Create a new `Web app` deployment, execution as yourself, and giving access to `Anyone`:

![](./screenshots/setup-step-5.1.png)

![](./screenshots/setup-step-5.2.png)

![](./screenshots/setup-step-5.3.png)

7. Copy the resultant `Web app URL`, as it will be required for setting up the iOS shortcuts

![](./screenshots/setup-step-6.png)

8. From your iPhone or iPad, go to the [transactions shortcut](https://www.icloud.com/shortcuts/e1a22f09e5c6444d885c32168bfb0bfe), and tap `Set Up Shortcut`
9. For the first question, paste the `Web app URL` from the step 6
10. For the second question, paste the list of your categories, excluding your credit cards, as these shouldn't be used for transactions. One category per line, i.e
    ```
    Category 1
    Category 2
    ```
11. For the third question, paste the list of your accounts
12. From your iPhone or iPad, go to the [category transfers shortcut](https://www.icloud.com/shortcuts/2d200b821e6249f89fbdbdc17982b49a), and tap `Set Up Shortcut`
13. For the first question, paste the `Web app URL` from the step 6
14. For the second question, paste the list of your categories, including your credit cards, as these can be used for category transfers
15. Feel free to add these shortcuts as bookmarks in your home screen

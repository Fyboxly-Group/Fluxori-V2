/**
 * Type declarations for Xero API
 */
declare module 'xero-node' {
  // Common interfaces
  export interface XeroIdObject {
    Id?: string;
  }

  export interface XeroDateObject {
    Date?: string;
  }

  export interface XeroAmount {
    Amount?: number;
    Currency?: string;
  }

  export interface XeroResponse<T> {
    Id: string;
    Status: string;
    ProviderName: string;
    DateTimeUTC: string;
    [key: string]: any;
  }

  // Contact interfaces
  export interface XeroAddress {
    AddressType?: string;
    AddressLine1?: string;
    AddressLine2?: string;
    AddressLine3?: string;
    AddressLine4?: string;
    City?: string;
    Region?: string;
    PostalCode?: string;
    Country?: string;
    AttentionTo?: string;
  }

  export interface XeroPhone {
    PhoneType?: string;
    PhoneNumber?: string;
    PhoneAreaCode?: string;
    PhoneCountryCode?: string;
  }

  export interface XeroContact {
    ContactID?: string;
    ContactNumber?: string;
    AccountNumber?: string;
    ContactStatus?: "ACTIVE" | "ARCHIVED";
    Name?: string;
    FirstName?: string;
    LastName?: string;
    EmailAddress?: string;
    SkypeUserName?: string;
    ContactPersons?: XeroContactPerson[];
    BankAccountDetails?: string;
    TaxNumber?: string;
    AccountsReceivableTaxType?: string;
    AccountsPayableTaxType?: string;
    Addresses?: XeroAddress[];
    Phones?: XeroPhone[];
    IsSupplier?: boolean;
    IsCustomer?: boolean;
    DefaultCurrency?: string;
    UpdatedDateUTC?: string;
    ContactGroups?: { ContactGroupID: string; Status: string; }[];
    Website?: string;
    BrandingTheme?: { BrandingThemeID: string; };
    BatchPayments?: { BankAccountNumber: string; BankAccountName: string; Details: string; };
    Discount?: string;
    Balances?: { AccountsReceivable: XeroAmount; AccountsPayable: XeroAmount; };
    HasAttachments?: boolean;
  }

  export interface XeroContactPerson {
    FirstName?: string;
    LastName?: string;
    EmailAddress?: string;
    IncludeInEmails?: boolean;
  }

  // Invoice interfaces
  export enum LineAmountTypes {
    Exclusive = "Exclusive",
    Inclusive = "Inclusive",
    NoTax = "NoTax"
  }

  export enum InvoiceType {
    ACCPAY = "ACCPAY",
    ACCREC = "ACCREC"
  }

  export enum InvoiceStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    AUTHORISED = "AUTHORISED",
    PAID = "PAID",
    VOID = "VOID"
  }

  export interface XeroLineItem {
    Description?: string;
    Quantity?: number;
    UnitAmount?: number;
    ItemCode?: string;
    AccountCode?: string;
    TaxType?: string;
    TaxAmount?: number;
    LineAmount?: number;
    DiscountRate?: number;
    DiscountAmount?: number;
    Tracking?: { Name?: string; Option?: string; TrackingCategoryID?: string; TrackingOptionID?: string; }[];
    LineItemID?: string;
  }

  export interface XeroInvoice {
    Type?: InvoiceType;
    Contact?: Partial<XeroContact>;
    Date?: string;
    DueDate?: string;
    Status?: InvoiceStatus;
    LineAmountTypes?: LineAmountTypes;
    LineItems?: XeroLineItem[];
    SubTotal?: number;
    TotalTax?: number;
    Total?: number;
    InvoiceID?: string;
    InvoiceNumber?: string;
    Reference?: string;
    CurrencyCode?: string;
    CurrencyRate?: number;
    UpdatedDateUTC?: string;
    FullyPaidOnDate?: string;
    AmountDue?: number;
    AmountPaid?: number;
    URL?: string;
    HasAttachments?: boolean;
    Payments?: { PaymentID?: string; Date?: string; Amount?: number; Reference?: string; HasAccount?: boolean; HasValidationErrors?: boolean; }[];
    Prepayments?: { PrepaymentID?: string; Date?: string; Amount?: number; Reference?: string; CurrencyRate?: number; HasValidationErrors?: boolean; }[];
    Overpayments?: { OverpaymentID?: string; Date?: string; Amount?: number; Reference?: string; CurrencyRate?: number; HasValidationErrors?: boolean; }[];
    CreditNotes?: { CreditNoteID?: string; CreditNoteNumber?: string; Reference?: string; CurrencyRate?: number; RemainingCredit?: number; Allocations?: { Amount?: number; Date?: string; Invoice?: { InvoiceID?: string; InvoiceNumber?: string; } }[] }[];
    HasErrors?: boolean;
    StatusAttributeString?: string;
    ValidationErrors?: { Message?: string; }[];
    Warnings?: { Message?: string; }[];
    BrandingThemeID?: string;
    IsDiscounted?: boolean;
  }

  // Account interfaces
  export enum AccountType {
    BANK = 'BANK',
    CURRENT = 'CURRENT',
    CURRLIAB = 'CURRLIAB',
    DEPRECIATN = 'DEPRECIATN',
    DIRECTCOSTS = 'DIRECTCOSTS',
    EQUITY = 'EQUITY',
    EXPENSE = 'EXPENSE',
    FIXED = 'FIXED',
    INVENTORY = 'INVENTORY',
    LIABILITY = 'LIABILITY',
    NONCURRENT = 'NONCURRENT',
    OTHERINCOME = 'OTHERINCOME',
    OVERHEADS = 'OVERHEADS',
    PREPAYMENT = 'PREPAYMENT',
    REVENUE = 'REVENUE',
    SALES = 'SALES',
    TERMLIAB = 'TERMLIAB',
    PAYGLIABILITY = 'PAYGLIABILITY',
    SUPERANNUATIONEXPENSE = 'SUPERANNUATIONEXPENSE',
    SUPERANNUATIONLIABILITY = 'SUPERANNUATIONLIABILITY',
    WAGESEXPENSE = 'WAGESEXPENSE',
    WAGESPAYABLELIABILITY = 'WAGESPAYABLELIABILITY'
  }

  export interface XeroAccount {
    AccountID?: string;
    Code?: string;
    Name?: string;
    Type?: AccountType;
    TaxType?: string;
    Description?: string;
    EnablePaymentsToAccount?: boolean;
    ShowInExpenseClaims?: boolean;
    Status?: string;
    Class?: string;
    SystemAccount?: boolean;
    BankAccountNumber?: string;
    BankAccountType?: string;
    CurrencyCode?: string;
    ReportingCode?: string;
    ReportingCodeName?: string;
    HasAttachments?: boolean;
    UpdatedDateUTC?: string;
  }

  // Tax Rate interfaces
  export interface XeroTaxRate {
    Name?: string;
    TaxType?: string;
    CanApplyToAssets?: boolean;
    CanApplyToEquity?: boolean;
    CanApplyToExpenses?: boolean;
    CanApplyToLiabilities?: boolean;
    CanApplyToRevenue?: boolean;
    DisplayTaxRate?: number;
    EffectiveRate?: number;
    Status?: string;
    TaxComponents?: { Name?: string; Rate?: number; IsCompound?: boolean; }[];
  }

  // API Client interfaces
  export interface XeroClientConfig {
    clientId: string;
    clientSecret: string;
    redirectUris: string[];
    scopes: string;
    state?: string;
    httpTimeout?: number;
  }

  export interface TokenSet {
    id_token?: string;
    access_token: string;
    refresh_token?: string;
    token_type: string;
    scope?: string;
    expires_at?: number;
    session_state?: string;
  }

  export interface ResponseArgs {
    response: {
      statusCode: number;
      body: any;
      headers: Record<string, string>;
    };
  }

  // Xero API interface
  export interface AccountingAPI {
    getContacts(tenantId: string, where?: string, order?: string, page?: number): Promise<{ body: { Contacts?: XeroContact[] } }>;
    createContacts(tenantId: string, data: { Contacts: XeroContact[] }): Promise<{ body: { Contacts?: XeroContact[] } }>;
    getInvoices(tenantId: string, where?: string, order?: string, page?: number): Promise<{ body: { Invoices?: XeroInvoice[] } }>;
    createInvoices(tenantId: string, data: { Invoices: XeroInvoice[] }): Promise<{ body: { Invoices?: XeroInvoice[] } }>;
    getAccounts(tenantId: string): Promise<{ body: { Accounts?: XeroAccount[] } }>;
    getTaxRates(tenantId: string): Promise<{ body: { TaxRates?: XeroTaxRate[] } }>;
    createItems(tenantId: string, data: any): Promise<any>;
    getItems(tenantId: string): Promise<any>;
    createBankTransactions(tenantId: string, data: any): Promise<any>;
    getBankTransactions(tenantId: string): Promise<any>;
  }

  export class XeroClient {
    constructor(config?: XeroClientConfig);
    initialize(): Promise<void>;
    setTokenSet(tokenSet: TokenSet): void;
    refreshToken(): Promise<TokenSet>;
    readTokenSet(): TokenSet;
    apiCallback(method: string, endpoint: string, body?: any, contentType?: string): Promise<any>;
    accountingApi: AccountingAPI;
    getTokenSet(): TokenSet;
    getConsentUrl(): string;
    getOAuth2Token(url: string): Promise<TokenSet>;
    tenants(): Promise<XeroResponse<any>[]>;
    updateTenants(): Promise<XeroResponse<any>[]>;
    disconnectTenant(tenantId: string): Promise<any>;
    disconnect(): Promise<void>;
  }
}

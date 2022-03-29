export interface ZoteroItemsResponse {
    message: string;
    payload: ZoteroItem[];
}

export interface ZoteroItem {
    citationKey: string;
    item: Item;
    attachments: Attachment[];
}

export interface Attachment {
    key: string;
    version: number;
    itemType: ItemType;
    title?: string;
    parentItem: string;
    linkMode: LinkMode;
    contentType: ContentType;
    charset: Charset;
    path?: string;
    tags: AttachmentTag[];
    relations: AttachmentRelations;
    dateAdded: Date;
    dateModified: Date;
    url?: string;
    accessDate?: Date;
    filename?: string;
    note?: string;
}

export enum Charset {
    Empty = "",
    UTF8 = "utf-8",
    Windows1252 = "windows-1252",
}

export enum ContentType {
    ApplicationEpubZip = "application/epub+zip",
    ApplicationOctetStream = "application/octet-stream",
    ApplicationPDF = "application/pdf",
    AudioMPEG = "audio/mpeg",
    Empty = "",
    ImagePNG = "image/png",
    ImageTiff = "image/tiff",
    TextHTML = "text/html",
    TextPlain = "text/plain",
    VideoMp4 = "video/mp4",
}

export enum ItemType {
    Attachment = "attachment",
    AudioRecording = "audioRecording",
    BlogPost = "blogPost",
    Book = "book",
    BookSection = "bookSection",
    ConferencePaper = "conferencePaper",
    Document = "document",
    Email = "email",
    EncyclopediaArticle = "encyclopediaArticle",
    JournalArticle = "journalArticle",
    Letter = "letter",
    MagazineArticle = "magazineArticle",
    Manuscript = "manuscript",
    NewspaperArticle = "newspaperArticle",
    Presentation = "presentation",
    Report = "report",
    Thesis = "thesis",
    VideoRecording = "videoRecording",
    Webpage = "webpage",
}

export enum LinkMode {
    ImportedFile = "imported_file",
    ImportedURL = "imported_url",
    LinkedFile = "linked_file",
    LinkedURL = "linked_url",
}

export interface AttachmentRelations {
    "owl:sameAs"?: string[];
    "dc:relation"?: string[];
}

export interface AttachmentTag {
    tag: string;
}

export interface Item {
    key: string;
    version: number;
    itemType: ItemType;
    title?: string;
    libraryCatalog?: string;
    url?: string;
    accessDate?: Date;
    extra?: string;
    publisher?: string;
    ISBN?: string;
    pages?: string;
    bookTitle?: string;
    creators?: Creator[];
    tags: ItemTag[];
    collections: string[];
    relations: ItemRelations;
    dateAdded: Date;
    dateModified: Date;
    abstractNote?: string;
    date?: string;
    language?: Language;
    numPages?: string;
    shortTitle?: string;
    volume?: string;
    publicationTitle?: string;
    issue?: string;
    place?: string;
    series?: string;
    DOI?: string;
    ISSN?: string;
    journalAbbreviation?: string;
    callNumber?: string;
    websiteTitle?: string;
    thesisType?: string;
    university?: string;
    archiveLocation?: string;
    archive?: Archive;
    edition?: string;
    rights?: string;
    section?: string;
    proceedingsTitle?: string;
    blogTitle?: string;
    linkMode?: LinkMode;
    contentType?: string;
    charset?: string;
    filename?: string;
    runningTime?: string;
    conferenceName?: string;
    reportType?: string;
    seriesNumber?: string;
    websiteType?: string;
    path?: string;
    institution?: string;
    reportNumber?: string;
    numberOfVolumes?: string;
    subject?: string;
    encyclopediaTitle?: string;
    seriesTitle?: string;
}

export enum Archive {
    BeijingMunicipalArchive = "Beijing Municipal Archive",
    ComputerHistoryMuseum = "Computer History Museum",
    GPAGuangdongProvincialArchive = "GPA (Guangdong Provincial Archive)",
    HistoryAndPublicPolicyProgramDigitalArchive = "History and Public Policy Program Digital Archive",
    Jstor = "JSTOR",
    SMAShanghaiMunicipalArchive = "SMA (Shanghai Municipal Archive)",
}

export interface Creator {
    firstName?: string;
    lastName?: string;
    creatorType: CreatorType;
    name?: string;
}

export enum CreatorType {
    Author = "author",
    CastMember = "castMember",
    Contributor = "contributor",
    Director = "director",
    Editor = "editor",
    Performer = "performer",
    ReviewedAuthor = "reviewedAuthor",
    SeriesEditor = "seriesEditor",
    Translator = "translator",
}

export enum Language {
    CN = "cn",
    Chinese = "Chinese",
    De = "de",
    En = "en",
    EnAl = "en-al",
    EnGB = "en-gb",
    EnUS = "en-US",
    EnUs = "en-us",
    Eng = "eng",
    English = "English",
    ItIT = "it-IT",
    KoKR = "ko-KR",
    Kor = "kor",
    LanguageEN = "EN",
    LanguageEnUS = "en_US",
    LanguageEnglish = "english",
    Language中文 = "中文",
    Russian = "Russian",
    Vi = "vi",
    Zh = "zh",
    ZhCN = "zh-CN",
    ZhHans = "zh-Hans",
    ZhHansCN = "zh-Hans-CN",
    ZhHant = "zh-Hant",
    中文 = "中文;",
    英文 = "英文;",
}

export interface ItemRelations {
    "dc:replaces"?: string[];
    "owl:sameAs"?: string[];
    "dc:relation"?: string[];
}

export interface ItemTag {
    tag: string;
    type?: number;
}

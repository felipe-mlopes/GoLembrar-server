export interface EmailsToSendDto {
  emails: string[];
  subject: string;
  message: string;
  scheduled: Date;
}

export interface EmailDto {
  descHtml: string;
  emails: string[];
  ownerEmail: string;
  title: string;
}

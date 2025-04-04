// Declaration file for nodemailer
declare module 'nodemailer' {
  namespace nodemailer {
    interface TransportOptions {
      host?: string;
      port?: number;
      secure?: boolean;
      auth?: {
        user?: string;
        pass?: string;
        type?: string;
        clientId?: string;
        clientSecret?: string;
        refreshToken?: string;
        accessToken?: string;
      };
      tls?: {
        rejectUnauthorized?: boolean;
      };
      service?: string;
      [key: string]: any;
    }

    interface MailOptions {
      from?: string;
      to?: string | string[];
      cc?: string | string[];
      bcc?: string | string[];
      subject?: string;
      text?: string;
      html?: string;
      attachments?: Array<{
        filename?: string;
        content?: string | Buffer;
        path?: string;
        contentType?: string;
        cid?: string;
      }>;
      headers?: { [key: string]: string };
      [key: string]: any;
    }

    interface SentMessageInfo {
      messageId: string;
      envelope: {
        from: string;
        to: string[];
      };
      accepted: string[];
      rejected: string[];
      pending: string[];
      response: string;
    }

    interface Transporter {
      sendMail(mailOptions: MailOptions): Promise<SentMessageInfo>;
      verify(): Promise<boolean>;
      close(): void;
    }
  }

  function createTransport(options: nodemailer.TransportOptions): nodemailer.Transporter;
  function createTransport(transport: any, defaults?: nodemailer.MailOptions): nodemailer.Transporter;

  export = {
    createTransport,
  };
}
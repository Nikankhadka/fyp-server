
export interface mailBody{
    from:string,
    to:string,
    subject:string,
    text:string,
    html:string,
    attachments?:[{
        filename:string,
        content: string;
        encoding: 'base64' | 'utf-8' | 'binary' | 'hex' | 'quoted-printable' | '7bit' | '8bit' | 'binary';
}]
}
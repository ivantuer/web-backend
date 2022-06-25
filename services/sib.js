const Sib = require('sib-api-v3-sdk')

class SibService {
    constructor() {
        this.client = Sib.ApiClient.instance;
        this.apiKey = this.client.authentications['api-key'];
        this.apiKey.apiKey = "PASTE YOUR TOKEN"
        this.transEmailApi = new Sib.TransactionalEmailsApi()
    }

    async sendEmails(sender, recievers, options={}){
        try{
            const result = await this.transEmailApi
                .sendTransacEmail({
                    sender,
                    to: recievers,
                    ...options,
                })
        } catch (e){
            console.log(e)
        }
    }
}

module.exports = SibService

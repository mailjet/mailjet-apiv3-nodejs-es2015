import MailjetClient from './mailjet-next';

class MailjetTest extends MailjetClient {
  constructor (apiKey, apiSecret) {
    super(apiKey, apiSecret, true);

    this.results = {
      'send': [],
      'user': [],
      'csvdata': [],
      'sender': [],
    };
  }

  send () {
    let data = this.post('send')
      .request({
        'FromName': 'Guillaume Badi',
        'FromEmail': 'gbadi@student.42.fr',
        'Subject': 'Hello Subject',
        'Recipients': [
          {'Email': 'gbadi@mailjet.com'},
        ],
      });

      this.results['send'].push(data.data === {} || data.url !== 'https://api.mailjet.com/v3/send' ? false : true);
      return this;
  }

  user () {
    let data = this.get('user')
      .request();

    this.results['user']
      .push(data.url !== 'https://api.mailjet.com/v3/REST/user' ?
              false : true);

    return this;
  }

  csvdata () {

    let data = this.post('contactslist')
      .id(37)
      .action('csvdata')
      .request('data');

    this.results['csvdata']
      .push(data.url !== 'https://api.mailjet.com/v3/DATA/contactslist/37/CSVData/text:plain' || data.data !== 'data' ?
        false : true);

    return this;
  }

  sender () {
    let data = this.post('sender')
      .request({
        Email: 'gbadi@student.42.fr',
      });

    this.results['sender']
      .push(data.url === 'https://api.mailjet.com/v3/REST/sender' ? true : false);

    return this;
  }

  contactlist () {
    let data = this.get('contactslist')
      .request();

    this.results['contactslist']
      .push(data.url === 'https://api.mailjet.com/v3/REST/contactslist' ? true : false);
  }

  result () {
    let keys = Object.keys(this.results);
    for (let i in keys) {
      let key = keys[i],
          value = this.results[key];
      console.log (key, value.indexOf(false) === -1 ? 'pass' : 'fail');
    }
  }
}

let test = new MailjetTest()
  .send()
  .user()
  .csvdata()
  .sender();

test.result();

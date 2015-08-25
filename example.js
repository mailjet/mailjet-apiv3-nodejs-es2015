
import Mailjet from './mailjet-next';

let client = new Mailjet(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);

client
	.get('user')
	.request()
	.then((response) => {
		console.log (response.body)
	}, (err) => {
		console.log (err);
	});

client.post('sender')
	.request({Email: 'gbadi@mailjet.com'})
	.then((response) => {
		console.log (response.body);
	}, (err) => {
		console.log (err.body);
	});

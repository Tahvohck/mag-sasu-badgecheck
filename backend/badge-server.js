/*********
 * SETUP *
 *********/
var http		= require('http')
var https		= require('https')
var url			= require('url')
var fs			= require('fs')
var strftime	= require('strftime')

var apikeyFile	= 'magprime-client.key'
var apicertFile	= 'magprime-client.crt'
var resultsfile	= 'resfile-staging.csv'

var listenPort	= 28421
var verbose		= true

var postObj		= {jsonrpc: '2.0', id:(new Date).getTime()}
postObj.method	= 'barcode.lookup_attendee_from_barcode'
//postObj.method	= 'attendee.lookup'

var apiopts		= {
	hostname:	'onsite.uber.magfest.org',
	port:		4444,
	path:		'/jsonrpc/',
	method:		'POST',
	key:		fs.readFileSync(apikeyFile),
	cert:		fs.readFileSync(apicertFile),
	headers:	{
		'Content-Type': 'application/json' }
}


/***********
 * PROGRAM *
 ***********/
var version = '0.2a'
function serverMain (requ, resp) {
}

var server = http.createServer(serverMain)
server.listen(listenPort)

console.log('--Badgecheck backend ' + version + ' init complete--')
console.log('Listening on ' + server.address().address + ':' + server.address().port)
server.close()
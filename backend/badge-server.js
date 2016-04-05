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

function dLog (message) {
	if (verbose) { console.log(message)}
}

function serverMain (requ, resp) {
	var reqURL = url.parse('http://' + requ.headers.host + requ.url, true)
	dLog('[RECV] ' + reqURL.href)

	switch (requ.method){
		case 'GET':
			handleGET(requ, resp, reqURL)
			break
		case 'POST':
		case 'PUT':
		case 'PATCH':
		case 'DELETE':
			resp.writeHead(501, 'ERROR: no implemented methods to ' + requ.method)
			resp.end()
			dLog('[ERRO] Not sure how to ' + requ.method)
			break
		default:
			console.log("[ERRO] Don't know method " + requ.method)
	}
}

// GET Primary logic
// Passed: Request URL, Response stream
function handleGET (requ, resp, reqURL) {
	var splitpath = reqURL.pathname.toLowerCase().split('/').slice(1)

	switch (splitpath[0]){
		case 'badge':
			break
		case 'echo':
			resp.writeHead(200, 'OK')
			resp.end(JSON.stringify(reqURL, null, 2))
			break
		default:
			resp.writeHead(404, 'Unable to get resource')
			resp.end('404: Resource [' + reqURL.href + '] not found')
	}
	resp.writeHead(501, 'ERROR: no implemented methods to ' + requ.method)
}

var server = http.createServer(serverMain)
server.listen(listenPort)

console.log('--Badgecheck backend ' + version + ' init complete--')
console.log('Listening on ' + server.address().address + ':' + server.address().port)
//server.close()

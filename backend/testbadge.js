//Reboot by: ctrl+C, then type r <enter>
/*********
 * SETUP *
 *********/
var http		= require('http')
var https		= require('https')
var url			= require('url')
var fs			= require('fs')
var strftime	= require('strftime')

var error		= {
}
var resultsfile	= "resfile-sat-overnight.csv"
var lastID		= 0
var sessions	= []
var postRawNum	= {jsonrpc: "2.0", method: "attendee.lookup", id:(new Date).getTime()}
var postRawScn	= {jsonrpc: "2.0", method: "barcode.lookup_attendee_from_barcode", id:(new Date).getTime()}
var apiopts		= {
	hostname: 'onsite.uber.magfest.org',
	port:	4444,
	path:	'/jsonrpc/',
	method:	'POST',
	key:	fs.readFileSync('magprime-client.key'),
	cert:	fs.readFileSync('magprime-client.crt'),
	headers: { 'Content-Type': "application/json" }
}


/***********
 * PROGRAM *
 ***********/
function sendback(ID) {
	console.log("Sending back session "+ID)
	var session	= sessions[ID]
	var resp	= session.strRes
	var requ	= session.strReq
	var body	= session.body

	session.head['content-length'] = body.length
	resp.writeHead(session.status, session.head)
	resp.write(body)
	resp.end()
}

function parseMAGResponse (rawData, sesID) {
	structData = JSON.parse(rawData).result
	var tmp = structData.full_name + "["
		+structData.badge_num + "] has a  "
		+structData.badge_type_label + " badge and has worked "
		+structData.worked_hours + "/"
		+structData.weighted_hours +" hours.\n"
	fs.appendFile(resultsfile, structData.full_name+","
		+structData.badge_num+","
		+structData.badge_type_label+","
		+structData.worked_hours+","
		+structData.weighted_hours+","
		+strftime('%Y-%m-%d %H:%M')+"\n")
	return tmp
}


function parseBadge(thisID, query) {
	var LPostRaw = postRawScn;	LPostRaw.params = [query.bid]
	var postData = JSON.stringify(LPostRaw)
	var LApiopts = apiopts; LApiopts.headers['Content-Length'] = postData.length
	var apiData = ""

//	sessions[thisID].body += "Looking for badge ["+query.bid+"]\n"
	var apireq = https.request(LApiopts, function (mres) {
		mres.setEncoding('utf-8')
		mres.ID = apireq.ID
		mres.on('data', function(chunk) {
			apiData += chunk
			console.log(mres.ID+": Got a chunk.")
		})
		mres.on('end', function () {
			console.log(apireq.ID+": End data")
			sessions[apireq.ID].body += parseMAGResponse(apiData, apireq.ID)
			sendback(apireq.ID)
		})
	})

	apireq.on('error', function(e) {
		console.log("Request failed:\n" + e.message)
	})
	apireq.ID=thisID

	apireq.write(postData)
}


function handlerequest (requ, resp){
	var rURL = "null://"+requ.headers.host+requ.url
	console.log("[RECV] "+rURL)
	var thisID = ++lastID
	sessions[thisID] = {
		strRes	:	resp,
		strReq	:	requ,
		status	:	200,
		head	:	{ 'Content-Type': 'text/plain' },
		ready	:	false,
		body	:	"",
	}
	resp.ID = thisID

	var prettyURL = url.parse(rURL, true)
/*	sessions[thisID].body += "You connected to "+prettyURL.hostname+" on port "+prettyURL.port+"\n"
	sessions[thisID].body += "You addressed '"+prettyURL.pathname+"' with the following variables:\n"
	for (key in prettyURL.query) {
		sessions[thisID].body += "  "+key+": "+prettyURL.query[key]+"\n"
	}
*/

	var splitpath = prettyURL.pathname.split("/").slice(1)
	switch (splitpath[0]){
		case "quit":
			sessions[thisID].body += "Quitting server"
			resp.end()
			requ.connection.destroy()
			server.close()
			break
		case "badge":
			parseBadge(thisID, prettyURL.query)
			break
		default:
			sessions[thisID].body += "I don't know that page ("+splitpath[0]+")"
	}

//	server.close()
}

var server = http.createServer(handlerequest)
server.listen(28421)

console.log('DONE')

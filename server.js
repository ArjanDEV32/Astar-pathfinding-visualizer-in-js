const fs = require("fs")
const http = require("http")

try {
  http.createServer(function (req, res) {  
		if(req.url=="/"){ 
			html = fs.readFileSync("index.html","utf-8")
			res.writeHead(200, {"Content-Type": "text/html"})
			res.end(html)
		}
		if(req.url=="/A*.js"){    
			res.writeHead(200, {"Content-Type": "text/js"})
			fileStream = fs.createReadStream("A*.js", "UTF-8");
			fileStream.pipe(res);
		}
  }).listen(4040,()=>{console.log("http://localhost:4040/")})

} catch(err){console.log(err), process.exit(1)}
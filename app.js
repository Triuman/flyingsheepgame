
//Başlangıçta benim profilimde yazan her şey anlamsız karakterlerden oluşsun. Aşağıdaki gibi ama daha güzel görünen.

//https://coolsymbol.com/
//bu siteden alınabilir.

//#$^^&#%&^%**^#%*#$%&%$&%$*%$&%$^#^%*$#%#@%$%&%$$#&**()&)($^%&%$^@$%!^$%^$%^^%@^%@%&#%&&%#%^*@%$^$#%@*

//Web URL'nin sonuna ?number= query stringi eklendiği zaman sayfa Webrtc ile birbirine bağlanmaya çalışıyor library üzerinden.
//number=462 ise bağlanmaya çalıştıkları odanın adı "flying462sheep" olabilir.
//İki tab birbirine bağlanınca arka plan renklerinin yeri tam zıttı olsun ikisinde de.
//Birisinde mouse hareket ettirince diğerinde bir top hareket etsin


var app = require('express')();
var http = require('http').createServer(app);

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});
const port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('listening on *:' + port);
});
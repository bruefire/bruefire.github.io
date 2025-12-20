function GetElementsByClassName(targetClass, parent){	//クロスブラウザ対応："getElementsByClassName"
 if(typeof document.getElementsByclassName == "undefined"){
    var foundElements = new Array();
    var allElements = parent.getElementsByTagName("*");
    var j=0;
    for (var i=0;i<allElements.length;i++) {
	  if(allElements[i].className!=null)var splits = allElements[i].className.split(" ");
	  for(k=0;k<splits.length;k++){
	        if (splits[k] == targetClass) {
			foundElements[j] = allElements[i];
			j++;
			break;
	        }
	  }
    }  
    return foundElements;
 }else{
    foundElements = [];
    var kari = parent.getElementsByClassName(targetClass);
    for (i=0;i<kari.length;i++) {
	var splits = kari.className.split(" ");
   	for (k=0;k<splits.length;k++) {
		if (splits[k] == targetClass) {
			foundElements.push(splits[k]);
			break;
		}
    	}
    }
    return foundElements;
 }
}
// HTMLフォームの形式にデータを変換する
function EncodeHTMLForm( data ){
    var params = [];
    for( var name in data ){
        var value = data[ name ];
        var param = encodeURIComponent( name ) + '=' + encodeURIComponent( value );
        params.push( param );
		
    }
    return params.join( '&' ).replace( /%20/g, '+' );
}
var CMCs;


//------------------------------------------------------------
//--------------- 定数, 変数 -------------------//

var PLR_SPEED = 0.2;
var spdMtp = 0;

var PIE = 3.1415926535;
var DEG = (1/180.0)*PIE;
var ANG = (1/PIE)*180.0;
var radius = 30.0;

var WIDTH = 0;
var HEIGHT = 0;
var CR_RANGE_X = 0;
var CR_RANGE_Y = 0;	//カメラ設定

var cRangeX = 0;	
var cRangeY = 0;

var obMove = true;
var preCm_rotX = 0.0, preCm_rotY = 0.0, preCm_rotZ = 0.0;
var in_rotX = 0.0, in_rotY = 0.0, in_rotZ = 0.0;
var cm_loc = [0.0, 0.0, 0.0];

//----オブジェクト情報
var meshNames = ['dosei', 'cube8', 'wLines'];	// 読み込むメッシュ名
var objLens = [];
var objIdx = {};

//------------------------------------------------------------
var flag = false;
var shift = false;
var registEx=0, registEy=0;

var rdObj = 0;
var ldObj = 0;
var itvID;
var VIEW_DST = false;
var decMode = 1;
//--
var keyA = false, keyD = false, keyS = false, keyW = false, keySP = 0;
window.onload = function()
{
	//alert(document.documentElement.clientWidth + '+' + document.documentElement.clientHeight);
	//------------------------------------------------
	//------------------------------------------------
	document.onkeydown = function (e){
		if(!e) e = window.event; // レガシー
		if(e.key=="1") obMove = !obMove;
		else if(e.key=="2") shoot();
		else if(e.key=="3") ChangePlrSpd();
		else if(e.code=="KeyA") keyA = 1;
		else if(e.code=="KeyD") keyD = 1;
		else if(e.code=="KeyS") keyS = 1;
		else if(e.code=="KeyW") keyW = 1;
		else if(e.code=="Space"){
			keySP = 1;
			e.preventDefault();
		}
		else if(e.key=="Shift") shift = true;
		
	};
	document.onkeyup = function (e){
		if(!e) e = window.event; // レガシー
		
		if(e.code=="KeyA") keyA = 0;
		else if(e.code=="KeyD") keyD = 0;
		else if(e.code=="KeyS") keyS = 0;
		else if(e.code=="KeyW") keyW = 0;
		else if(e.code=="Space") keySP = 0;
		
		if(e.key=="Shift") shift = false;
		// 出力テスト
		
	};
	
	window.onmousedown = function(ev){
		if(ev == null) ev = event;
		registEx = ev.clientX;
		registEy = ev.clientY;
		flag = true;
	}
	window.ontouchstart = function(ev){
		if(ev == null) ev = event;
		registEx = ev.changedTouches[0].pageX;
		registEy = ev.changedTouches[0].pageY;
		flag = true;
	}
	
	var upEv = function(){
		flag = false;
	}
	window.onmouseup = upEv;
	window.ontouchend = upEv;
	
	window.onmousemove = function(ev)
	{
		if(ev == null) ev = event;
		if(flag == true){	//内部ｳｨﾝﾄﾞｳ移動
			if(1){
				preCm_rotX = (ev.clientX - registEx) /300.0;	//-- ラジアン
				preCm_rotY = (ev.clientY - registEy) /300.0;		//-- ラジアン
				in_rotX += preCm_rotX;	//-- 入力
				in_rotY += preCm_rotY;	//-- 入力
			}else{
				// cm_loc[1] = -1*(ev.clientX - registEx) /300.0;
				// cm_loc[2] = 	(ev.clientY - registEy) /300.0;
			}
			//registLeft = form.offsetLeft;
			//registTop = form.offsetTop;
			registEx = ev.clientX;
			registEy = ev.clientY;
		}
		ev.preventDefault();
	}
	document.body.addEventListener("touchmove", function(ev)
	{
		if(ev == null) ev = event;
		if(flag == true){	//内部ｳｨﾝﾄﾞｳ移動
			if(1){
				preCm_rotX = (ev.changedTouches[0].pageX - registEx) /300.0;	//-- ラジアン
				preCm_rotY = (ev.changedTouches[0].pageY - registEy) /300.0;		//-- ラジアン
				in_rotX += preCm_rotX;	//-- 入力
				in_rotY += preCm_rotY;	//-- 入力
			}else{
				// cm_loc[1] = -1*(ev.clientX - registEx) /300.0;
				// cm_loc[2] = 	(ev.clientY - registEy) /300.0;
			}
			//registLeft = form.offsetLeft;
			//registTop = form.offsetTop;
			registEx = ev.changedTouches[0].pageX;
			registEy = ev.changedTouches[0].pageY;
		}
		ev.preventDefault();
	}, {passive: false});
	
	//--------------------------------
	//----------------------------------------------
	start();
	shader0 = initShaders("shader-vs", "shader-fs");
	shader3 = initShaders("points-vs", "points-fs");
	gl.useProgram(shader0);
    
	//__ 読み込みオブジェクト数
	rdObj = meshNames.length;
	initBuffers();
	
	//__ メッシュ取得
	for(var i=0;i<meshNames.length;i++)
		obGet(meshNames[i], i);
	
	//__ オブジェクト操作情報(obj数, objタイプ) ※呼出しごとに0からインデックス自動加算
	setObjInfo(1, "base");
	setObjInfo(100, "shoot");
	setObjInfo(1, "player");
	
	itvID = setInterval("standby()", 33);
	setTimeout('location.reload()', 1000*60*45);
	
}
var bgnTime;
var endTime;
function standby(){
	if(rdObj==ldObj){
		clearInterval(itvID);
		init_on4();
		
		itvID = setTimeout("engine()", 33);
		setInterval("sync()", 200);shoot();
	}
}


//------------------------------------------------------------

//-----------------------------------------------------------


function start() {
  var canvas = document.getElementById("glcanvas");
  var cvs2d = document.getElementById("canvas2d");
  
  // キャンバスサイズ変更
  WIDTH = document.documentElement.clientWidth;
  HEIGHT = document.documentElement.clientHeight;
  canvas.width  = WIDTH;
  canvas.height = HEIGHT;
  cvs2d.width  = WIDTH;
  cvs2d.height = HEIGHT;
  
  CR_RANGE_X = 90.0;
  CR_RANGE_Y = Math.atan( Math.tan((CR_RANGE_X)/2*PIE/180)*HEIGHT/WIDTH ) *2/PIE*180;	//カメラ設定
  cRangeX = Math.tan(CR_RANGE_X/2 *PIE/180);	
  cRangeY = Math.tan(CR_RANGE_Y/2 *PIE/180);
  
    if(document.body.onmousewheel===undefined) document.body.addEventListener('DOMMouseScroll', function(ev){
		if(ev == null) ev = event;
		if(1){
				preCm_rotZ = ev.detail /-25.0;
				in_rotZ += preCm_rotZ;
		}
		ev.preventDefault();
    }, false);
	else document.body.onmousewheel = function(ev){			//※1
		if(ev == null) ev = event;
		if(1){
				preCm_rotZ = ev.wheelDelta /1000.0;
				in_rotZ += preCm_rotZ;
		}
		ev.preventDefault();
	}

  // GL コンテキストを初期化
  gl = initWebGL(canvas);
  
  // WebGL を使用できる場合に限り、処理を継続
  
  if (gl) {
    // クリアカラーを黒色、不透明に設定する
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 深度テストを有効化
    gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
    // 近くにある物体は、遠くにある物体を覆い隠す
    gl.depthFunc(gl.LEQUAL);
    // カラーバッファや深度バッファをクリアする
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}



function initWebGL(canvas) {
  gl = null;
  
  try {
    // 標準コンテキストの取得を試みる。失敗した場合は、experimental にフォールバックする。
    gl = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl");
  }
  catch(e) {}
  
  // GL コンテキストを取得できない場合は終了する
  if (!gl) {
    alert("WebGL を初期化できません。ブラウザはサポートしていないようです。");
    gl = null;
  }
  
  return gl;
}


var shader0, shader3;
function initShaders(vs, fs) {
  var vertexShader = getShader(gl, vs);
  var fragmentShader = getShader(gl, fs);
  
  // シェーダープログラムを作成
  var shader = gl.createProgram();
  gl.attachShader(shader, vertexShader);
  gl.attachShader(shader, fragmentShader);
  gl.linkProgram(shader);
  
  // シェーダープログラムを作成できない場合はアラートを表示
  
  if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
    alert("シェーダープログラムを初期化できません。");
  }
  
  //vpAttribute = gl.getAttribLocation(shader0, "vPosition");
  gl.enableVertexAttribArray(0);
  return shader;
}




function getShader(gl, id) {
  var shaderScript, theSource, currentChild, shader;
  
  shaderScript = document.getElementById(id);
  
  if (!shaderScript) {
    return null;
  }
  
  theSource = "";
  currentChild = shaderScript.firstChild;
  
  while(currentChild) {
    if (currentChild.nodeType == currentChild.TEXT_NODE) {
      theSource += currentChild.textContent;
    }
    
    currentChild = currentChild.nextSibling;
  }
  
  if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	  } else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	  } else {
		 // 未知のシェーダータイプ
		 return null;
  }
  gl.shaderSource(shader, theSource);
    
  // シェーダープログラムをコンパイル
  gl.compileShader(shader);  
    console.log(shader);
  // コンパイルが成功したかを確認
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
      console.log("シェーダーのコンパイルでエラーが発生しました: " + gl.getShaderInfoLog(shader));  
      return null;  
  }
    
  return shader;
}


var vBuf = [];
function initBuffers() {
	
	for(var i=0;i<rdObj;i++)
		vBuf[i] = gl.createBuffer();
	
  
}

//__ オブジェクトのインデックス
function getAllObjLen()
{
	var len = 0;
	for(var i=0;i<objLens.length;i++) len += objLens[i];
	
	return  len;
}
function getRngObjLen(end)
{
	var len = 0;
	for(var i=0;i<end;i++) len += objLens[i];
	
	return  len;
}

//__ オブジェクト操作情報
var setObjInfoCnt = 0;
function setObjInfo(len, objType)
{
	objLens[setObjInfoCnt] = len;
	objIdx[objType] = setObjInfoCnt;
	
	++setObjInfoCnt;
}


//////////bootstrap side menu///////////////
    function htmlbodyHeightUpdate(){
		var height3 = $( window ).height()
		var height1 = $('.nav').height()+50
		height2 = $('.main').height()
		if(height2 > height3){
			$('html').height(Math.max(height1,height3,height2)+10);
			$('body').height(Math.max(height1,height3,height2)+10);
		}
		else
		{
			$('html').height(Math.max(height1,height3,height2));
			$('body').height(Math.max(height1,height3,height2));
		}
		
	}
	$(document).ready(function () {
		htmlbodyHeightUpdate()
		$( window ).resize(function() {
			htmlbodyHeightUpdate()
		});
		$( window ).scroll(function() {
			height2 = $('.main').height()
  			htmlbodyHeightUpdate()
		});
	});








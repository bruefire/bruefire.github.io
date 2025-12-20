



var cnt = 0;
function engine(){
	bgnTime = new Date().getTime();

	cm_loc[0] = (Number(shift)-0.5)*-2*keySP;
	cm_loc[1] = keyD - keyA;
	cm_loc[2] = keyW - keyS;
	
	drawGL4();

	// canvasクリア
	var canvas = document.getElementById('canvas2d');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	DrawDistances();
	//-----
	endTime = new Date().getTime();
	var slpTime = 33 - (endTime - bgnTime);
	if(slpTime < 0) slpTime = 0;
	
	//-----	
	itvID = setTimeout("engine()", slpTime);
}

//--------------------------------------------------------
//--------------------------------------------------------
//--------------------------------------------------------
var xyz = {
		faces: [],
		fCol: [],
		pts: [],
		pts2: [],
		std: [],
		
		scale: 1,
		loc: { x:-0, y:0, z:0 },	//-- (緯度, 経度, 深度)
		lspX: { w:0, x:0, y:0, z:0},
		rot:{ x:0,y:0,z:0 },
		rsp: { x:0 , y:0 , z:0  },
		polObj: true
};
var camera = {
		faces: [],
		fCol: [],
		pts: [],
		pts2: [],
		std: [],
		
		scale: 1,
		loc: { x:0.0, y:0.0, z:0.0 },	//-- (緯度, 経度, 深度)
		lspX: { w:0.0, x:0.0, y:0.0, z:0.0},
		rot:{ x:0.0,y:0.0,z:0.0 },
		rsp: { x:0.0 , y:0.0 , z:0.0  },
		polObj: false
};
var cmData = {
	loc: {x:0, y:0, z:0},
	rot: {x:0,y:0,z:0}
};

function init_on4(){

	//-- 座標軸
	//--
	var dstX = PIE*radius;

	
	initObjs();
	init_std(-1, objs.length);

	return 0;
}

function init_std(bgn, end)
{
	for(var h=bgn; h<end; h++){//-----------オブジェクトごとの.std(基準位置)設定----------//
		var curObj;
		if(h==-1) curObj = camera; else curObj = objs[h];
		//-- 2つの基準ベクトル
		var std1 = { w:Math.cos(1.0), x:0, y:0, z:Math.sin(1.0) };// WXYZ
		var std2 = { w:Math.cos(1.0), x:0, y:Math.sin(1.0), z:0 };// WXYZ

		//-- 緯度,経度,深度に合わせる
		all_tudeRst(std1, curObj.loc, 1);
		all_tudeRst(std2, curObj.loc, 1);
		
		//-- 基準1を設定
		curObj.std[0] = {	x: Math.atan2(std1.x, std1.y),
									y: Math.atan2(pyth2(std1.x,std1.y), std1.z),
									z: Math.atan2(pyth3(std1.x,std1.y,std1.z), std1.w)
		}
		//-- 基準2を設定
		curObj.std[1] = {	x: Math.atan2(std2.x, std2.y),			
									y: Math.atan2(pyth2(std2.x,std2.y), std2.z),
									z: Math.atan2(pyth3(std2.x,std2.y,std2.z), std2.w)
		}
	//console.log(curObj);
	}
}
//--------------------------------------------------------
//--------------------------------------------------------
function initObjs()
{
	
	//__ ベースオブジェクト
	for(var num = getRngObjLen(objIdx.base );num<getRngObjLen(objIdx.base +1);num++)
	{
		objs[num] = 
		{
			mesh: meshs[2],
			meshIdx: 2,
			
			std: [],
			locr: null,
			objStd:null,
			
			scale: 90.0,
			loc: { x:-0.0*PIE, y:0.0*PIE, z:0.0*PIE },	//-- (緯度, 経度, 深度)
			lspX: { w:0.0, x:0*PIE, y:0.0*PIE, z:0.*PIE},
			rot:{ x:0,y:0,z:0 },
			rsp: { x:0 *DEG, y:0 *DEG, z:0 *DEG },
			
			used: true,
			polObj: false
		};
	}
	
	//__ 土星
	for(var num = getRngObjLen(objIdx.player);num<getRngObjLen(objIdx.player +1);num++)
	{
		objs[num] = 
		{
			mesh: meshs[0],
			meshIdx: 0,
			
			std: [],
			locr: null,
			objStd:null,
			
			scale: 1.0,
			loc: { x:-0.1*PIE, y:0.2*PIE, z:0.0*PIE },	//-- (緯度, 経度, 深度)
			lspX: { w:0.75, x:0*PIE, y:0.02*PIE, z:0.2*PIE},
			rot:{ x:0,y:0,z:0 },
			rsp: { x:0 *DEG, y:1 *DEG, z:0 *DEG },
			
			used: true,
			polObj: false
		};
	}
	
	//__ シュートオブジェクト
	for(var num = getRngObjLen(objIdx.shoot);num<getRngObjLen(objIdx.shoot +1);num++)
	{
		objs[num] = 
		{
			mesh: meshs[1],
			meshIdx: 1,
			
			std: [],
			locr: null,
			objStd:null,
			
			scale: 1.0,
			loc: { x:-0.1*PIE, y:0.2*PIE, z:0.0*PIE },	//-- (緯度, 経度, 深度)
			lspX: { w:0.1, x:0*PIE, y:0.02*PIE, z:0.2*PIE},
			rot:{ x:0,y:0,z:0 },
			rsp: { x:0 *DEG, y:1 *DEG, z:0 *DEG },
			
			used: false,
			polObj: false
		};
	}
	//objs[num-1].used = true;
	
}

//--------------------------------------------------------
//--------------------------------------------------------
//--------------------------------------------------------


function drawGL4(){
	
//=============== >>>ループ(メイン)<<< ==================
	
	//=====カメラの範囲
	var cRangeX = Math.tan(CR_RANGE_X/2 *PIE/180);	
	var cRangeY = Math.tan(CR_RANGE_Y/2 *PIE/180);
	//-- 中心から画面端までの角度
	//var cRangeD = pyth2(cRangeX, cRangeY);
	//CR_RANGE_D = atan( cRangeD )*2;


	//==============
	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//glFlush(); 
	//------------
	gl.useProgram(shader3);
	var xID = gl.getUniformLocation(shader3, "WH_CR");
	gl.uniform4f(xID, WIDTH, HEIGHT, cRangeX, cRangeY);
	//--
	gl.useProgram(shader0);
	xID = gl.getUniformLocation(shader0, "WH_CR");
	gl.uniform4f(xID, WIDTH, HEIGHT, cRangeX, cRangeY);
	xID = gl.getUniformLocation(shader0, "WH_Cr");		// ピクセルシェーダ用
	gl.uniform4f(xID, WIDTH, HEIGHT, cRangeX, cRangeY);

	//------------	
	//------- glm-js ---------
	var Projection = glm.perspective(glm.radians(CR_RANGE_Y), cRangeX / cRangeY, 0.00001, 100.0);
	var View       = glm.lookAt(
								glm.vec3(0,0,0), // Camera is at (4,3,-3), in World Space
								glm.vec3(0,1,0), // and looks at the origin
								glm.vec3(0,0,1)  // Head is up (set to 0,-1,0 to look upside-down)
						   );
	var Model      = glm.mat4(1.0);
	var MVP        = Projection['*'](View)['*'](Model);
	//-- end
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

	xID = gl.getUniformLocation(shader0, "MVP");
	gl.uniformMatrix4fv(xID, false, new Float32Array(MVP.elements));
	//------------

	for(var h=0;h<objs.length;h++){//-----------オブジェクトごとの速度更新----------//
	  var curObj = objs[h];
	  
	  if(obMove){		//-- 位置,速度,傾きのデータ更新
	   if(Math.pow(0.1,100) < Math.abs(curObj.lspX.w)){
//console.log(curObj.lspX.z);
		//----------. 位置,速度,基準位置の更新 <-------------
		// .lspX メンバを使用
		//-- 半径1.0として超球面上のUC座標を定義
		var vecT = tudeToEuc( curObj.lspX );	// 速度
		var std1 = tudeToEuc( curObj.std[0] );		// 基準位置1
		var std2 = tudeToEuc( curObj.std[1] );		// 基準位置2

		//-- 緯度,経度,深度を0に
		all_tudeRst(vecT, curObj.loc, 0);	// 速度
		all_tudeRst(std1, curObj.loc, 0); // 基準1
		all_tudeRst(std2, curObj.loc, 0); // 基準2

		//-- 進行方向1,2の特定
		var rotOn = [];
		rotOn[0] = Math.atan2(vecT.x, vecT.y);
		rotOn[1] = Math.atan2(pyth2(vecT.x, vecT.y), vecT.z);

		//-- 方向1,2を0に (基準1,2のみ)
		tudeRst2(std1, "x", "y", rotOn[0], 0);//-- X-Y 回転
		tudeRst2(std2, "x", "y", rotOn[0], 0);
		tudeRst2(std1, "y", "z", rotOn[1], 0);//-- Y-Z 回転
		tudeRst2(std2, "y", "z", rotOn[1], 0);

		//-- 進行距離分移動(Z-W回転)し、方向1,2へ合わせる(Y-Z, X-Y回転)
		var loc1 = {w:1.0,x:0.0,y:0.0,z:0.0}, vec1 = {w:1.0,x:0.0,y:0.0,z:0.0};
		tudeRst2(loc1, "z", "w", curObj.lspX.w/radius, 1);//-- 位置
		tudeRst2(vec1, "z", "w", curObj.lspX.w/radius *2, 1);//-- 速度
		tudeRst2(std1, "z", "w", curObj.lspX.w/radius, 1);//-- 基準1
		tudeRst2(std2, "z", "w", curObj.lspX.w/radius, 1);//-- 基準2
		//-- Y-Z 回転
		tudeRst2(loc1, "y", "z", rotOn[1], 1);//-- 基準1
		tudeRst2(vec1, "y", "z", rotOn[1], 1);//-- 基準1
		tudeRst2(std1, "y", "z", rotOn[1], 1);//-- 基準1
		tudeRst2(std2, "y", "z", rotOn[1], 1);//-- 基準2
		//-- X-Y 回転
		tudeRst2(loc1, "x", "y", rotOn[0], 1);//-- 基準1
		tudeRst2(vec1, "x", "y", rotOn[0], 1);//-- 基準1
		tudeRst2(std1, "x", "y", rotOn[0], 1);//-- 基準1
		tudeRst2(std2, "x", "y", rotOn[0], 1);//-- 基準2

		//-- 緯度,経度,深度を戻す
		all_tudeRst(loc1, curObj.loc, 1);	//-- 位置
		all_tudeRst(vec1, curObj.loc, 1);	//-- 速度
		all_tudeRst(std1, curObj.loc, 1);	//-- 基準1
		all_tudeRst(std2, curObj.loc, 1);	//-- 基準2

		//-- 位置,速度,基準位置を上書き (end
		curObj.loc = eucToTude(loc1);
		var tmp = eucToTude(vec1);
			curObj.lspX = { w:curObj.lspX.w, x:tmp.x, y:tmp.y, z:tmp.z };
		curObj.std[0] = eucToTude(std1);
		curObj.std[1] = eucToTude(std2);

		
		if(curObj.lspX.w<0) curObj.lspX.w *= -1;	//-- 初回以外常に+の速度
	   }
	   //----------- 傾きの更新 -------------
	   curObj.rot = {	x: curObj.rot.x+curObj.rsp.x,
								y: curObj.rot.y+curObj.rsp.y,
								z: curObj.rot.z+curObj.rsp.z  };
	  }
	}
  
	//---- カメラ ----//
	var cmrStd = [];
	camera.rot = { x:-preCm_rotX, y:preCm_rotY, z:preCm_rotZ };
	if(1){
		var curObj = camera;
		//----------. 傾きの更新。その後に位置,基準位置の更新 <-------------
		//-- 半径1.0として超球面上のUC座標を定義
		var std1 = tudeToEuc( curObj.std[0] );		// 基準位置1
		var std2 = tudeToEuc( curObj.std[1] );		// 基準位置2
		//-- 緯度,経度,深度を0に
		all_tudeRst(std1, curObj.loc, 0);// 基準1
		all_tudeRst(std2, curObj.loc, 0);// 基準2

		//-- ここから変化 --//
		//-- 基準方向1,2,3の特定
		var rotStd = [];
		clcStd(std1, std2, rotStd);
		//-------- 傾きの更新 ----------
		//-- 2つの基準ベクトルを再定義
		var ntd1 = { w:Math.cos(1.0), x:0, y:0, z:Math.sin(1.0) };// WXYZ
		var ntd2 = { w:Math.cos(1.0), x:0, y:Math.sin(1.0), z:0 };// WXYZ
		//-- 新たな方向ベクトル
		tudeRst2(ntd2, "x", "y", camera.rot.z, 1);//-- X-Y 回転 (+方向3
		tudeRst2(ntd1, "y", "z", camera.rot.y, 1);//-- Y-Z 回転 (+方向2
		tudeRst2(ntd2, "y", "z", camera.rot.y, 1);//-- Y-Z 回転 (+方向2
		tudeRst2(ntd1, "x", "z", camera.rot.x, 1);//-- X-Z 回転 (+方向1
		tudeRst2(ntd2, "x", "z", camera.rot.x, 1);//-- X-Z 回転 (+方向1
		//-- 既存方向ベクトルを加える
		tudeRst2(ntd1, "x", "y", rotStd[2], 1);//-- X-Y 回転 (+方向3
		tudeRst2(ntd2, "x", "y", rotStd[2], 1);//-- X-Y 回転 (+方向3
		tudeRst2(ntd1, "y", "z", rotStd[1], 1);//-- Y-Z 回転 (+方向2
		tudeRst2(ntd2, "y", "z", rotStd[1], 1);//-- Y-Z 回転 (+方向2
		tudeRst2(ntd1, "x", "y", rotStd[0], 1);//-- X-Y 回転 (+方向1
		tudeRst2(ntd2, "x", "y", rotStd[0], 1);//-- X-Y 回転 (+方向1
		std1 = ntd1, std2 = ntd2;

		//-- 改めて基準方向1,2,3の特定
		clcStd(std1, std2, rotStd);	//-- (傾きの更新 end
		
		//-------- 位置,基準位置の更新 ----------
		//-- 進行方向1,2の特定
		//-- その際、cm_locを基準方向に合わせる
		var cmLc = {w:0.0, x:cm_loc[1], y:cm_loc[2], z:cm_loc[0]};
		tudeRst2(cmLc, "x", "y", rotStd[2], 1);//-- X-Y 回転 (+方向3
		tudeRst2(cmLc, "y", "z", rotStd[1], 1);//-- Y-Z 回転 (+方向2
		tudeRst2(cmLc, "x", "y", rotStd[0], 1);//-- X-Y 回転 (+方向1
		var rotOn = [];
		rotOn[0] = Math.atan2(cmLc.x, cmLc.y);				
		rotOn[1] = Math.atan2(pyth2(cmLc.x, cmLc.y), cmLc.z);
		//cmLc.w = 3*pyth3(cmLc.x, cmLc.y, cmLc.z);
		if(!cmLc.x && !cmLc.y && !cmLc.z) cmLc.w = 0.0; else cmLc.w = PLR_SPEED * Math.pow(3, spdMtp);
		//-- 以下同様 --//

		//-- 進行方向1,2を0に (基準1,2のみ)
		tudeRst2(std1, "x", "y", rotOn[0], 0);//-- X-Y 回転
		tudeRst2(std2, "x", "y", rotOn[0], 0);
		tudeRst2(std1, "y", "z", rotOn[1], 0);//-- Y-Z 回転
		tudeRst2(std2, "y", "z", rotOn[1], 0);
		//-- 進行距離分移動(Z-W回転)し、進行方向1,2へ合わせる(Y-Z, X-Y回転)
		var loc1 = {w:1.0, x:0.0, y:0.0, z:0.0};
		tudeRst2(loc1, "z", "w", cmLc.w/radius, 1);//-- 位置
		tudeRst2(std1, "z", "w", cmLc.w/radius, 1);//-- 基準1
		tudeRst2(std2, "z", "w", cmLc.w/radius, 1);//-- 基準2
		//-- Y-Z 回転
		tudeRst2(loc1, "y", "z", rotOn[1], 1);//-- 位置
		tudeRst2(std1, "y", "z", rotOn[1], 1);//-- 基準1
		tudeRst2(std2, "y", "z", rotOn[1], 1);//-- 基準2
		//-- X-Y 回転
		tudeRst2(loc1, "x", "y", rotOn[0], 1);//-- 位置
		tudeRst2(std1, "x", "y", rotOn[0], 1);//-- 基準1
		tudeRst2(std2, "x", "y", rotOn[0], 1);//-- 基準2
		//-- 緯度,経度,深度を戻す
		all_tudeRst(loc1, curObj.loc, 1);	//-- 位置
		all_tudeRst(std1, curObj.loc, 1);	//-- 基準1
		all_tudeRst(std2, curObj.loc, 1);	//-- 基準2
		//-- 位置,基準位置を上書き (end
		curObj.loc		 = eucToTude(loc1);
		curObj.std[0] = eucToTude(std1);
		curObj.std[1] = eucToTude(std2);



		//----------- 更新後のカメラ基準の測定 -------------
		//-- 半径1.0として超球面上のUC座標を定義
		std1 = tudeToEuc( curObj.std[0] );	// 基準1
		std2 = tudeToEuc( curObj.std[1] );	// 基準2
		//-- 緯度,経度,深度を0に
		all_tudeRst(std1, curObj.loc, 0);// 基準1
		all_tudeRst(std2, curObj.loc, 0);// 基準2
		//-- 基準方向1,2,3の特定
		clcStd(std1, std2, cmrStd);
	//console.log(std2);
	}


	cmData.loc = { x:cm_loc[0], y:cm_loc[1], z:cm_loc[2] };
	cmData.rot = { x:preCm_rotX, y:preCm_rotY, z:preCm_rotZ };
	cm_loc[0] = cm_loc[1] = cm_loc[2] = preCm_rotX = preCm_rotY = preCm_rotZ = 0.0;
//===============^^^^^^^^^~~~~~~~~~~-----------
//===============^^^^^^^^^~~~~~~~~~~-----------
 for(var h=0;h<objs.length;h++){	//==============オブジェクトごとの処理==============//
	var curObj;
	curObj = objs[h];
	//var drawLoc;


	//---- ▼カメラ位置を考慮して移動 ----//
	//-- 毎度のtude > euc変換, tude0
	var locT = tudeToEuc( curObj.loc );	//-- 位置
	var std1 = tudeToEuc( curObj.std[0] );	//-- 基準1
	var std2 = tudeToEuc( curObj.std[1] );	//-- 基準2
	all_tudeRst(locT, camera.loc, 0);	//-- 位置
	all_tudeRst(std1, camera.loc, 0);	//-- 基準1
	all_tudeRst(std2, camera.loc, 0);	//-- 基準2
	//-- カメラ基準(回転)を考慮して移動	(大円回転
	tudeRst2(locT, "x", "y", cmrStd[0], 0);//-- X-Y 回転 (-方向1
	tudeRst2(std1, "x", "y", cmrStd[0], 0);
	tudeRst2(std2, "x", "y", cmrStd[0], 0);
	tudeRst2(locT, "y", "z", cmrStd[1], 0);//-- Y-Z 回転 (-方向2
	tudeRst2(std1, "y", "z", cmrStd[1], 0);
	tudeRst2(std2, "y", "z", cmrStd[1], 0);
	tudeRst2(locT, "x", "y", cmrStd[2], 0);//-- X-Y 回転 (-方向3
	tudeRst2(std1, "x", "y", cmrStd[2], 0);
	tudeRst2(std2, "x", "y", cmrStd[2], 0);

	//------ オブジェクトの見かけの座標を計算 ------
	var locR = eucToTude(locT);
	curObj.locr = locR;	//-- 地図で使用するため格納
	//-- 緯度,経度,深度を0に
	all_tudeRst(std1, locR, 0);// 基準1
	all_tudeRst(std2, locR, 0);// 基準2
	//-- オブジェクト基準方向1,2,3の特定
	var objStd = [];
	clcStd(std1, std2, objStd);

	curObj.objStd = { x:objStd[0], y:objStd[1], z:objStd[2] };	//-- 光用 面倒なので
 
 }
 
 for(var h=0;h<objs.length;h++)
 {
	// xID = gl.getUniformLocation(shader0, "sLoc");
	// gl.uniform3f(xID, objs[2].locr.x, objs[2].locr.y, objs[2].locr.z);
	var curObj = objs[h];
	if(curObj.used == false) continue;
	
	if(curObj.mesh.dMode==3){
		gl.useProgram(shader0);
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuf[curObj.meshIdx]);
		
		//__ Uniform変数
		xID = gl.getUniformLocation(shader0, "scl_rad");
		gl.uniform2f(xID, curObj.scale, radius);
		xID = gl.getUniformLocation(shader0, "objRot");
		gl.uniform3f(xID, curObj.rot.x, curObj.rot.y, curObj.rot.z);
		xID = gl.getUniformLocation(shader0, "objStd");
		gl.uniform3f(xID, curObj.objStd.x, curObj.objStd.y, curObj.objStd.z);
		xID = gl.getUniformLocation(shader0, "locR");
		gl.uniform3f(xID, curObj.locr.x, curObj.locr.y, curObj.locr.z);
		
		xID = gl.getUniformLocation(shader0, "texJD");
		gl.uniform1i(xID, 0);
		xID = gl.getUniformLocation(shader0, "decMode");
		gl.uniform1i(xID, decMode);
		xID = gl.getUniformLocation(shader0, "sunJD");
		gl.uniform1i(xID, 0);
		xID = gl.getUniformLocation(shader0, "revMd");
		gl.uniform1f(xID, 1.0);
		
		var byteLen = 21*4;
		
		for(var i=0;i<8;i++)
			gl.enableVertexAttribArray(i);
		
		gl.vertexAttribPointer(	// 属性 0	vPosX
			0, 3, gl.FLOAT, false,       
			byteLen, 0      
		);
		gl.vertexAttribPointer(	// 属性 1	vColor
			1, 3, gl.FLOAT, false,       
			byteLen, 3*4      
		);
		gl.vertexAttribPointer(	// 属性 2	vPos1
			2, 3, gl.FLOAT, false,       
			byteLen, 6*4      
		);
		gl.vertexAttribPointer(	// 属性 3	vPos2
			3, 3, gl.FLOAT, false,       
			byteLen, 9*4      
		);
		gl.vertexAttribPointer(	// 属性 4	vPos3
			4, 3, gl.FLOAT, false,       
			byteLen, 12*4      
		);
		gl.vertexAttribPointer(	// 属性 5	TXR1
			5, 2, gl.FLOAT, false,       
			byteLen, 15*4      
		);
		gl.vertexAttribPointer(	// 属性 6	TXR2
			6, 2, gl.FLOAT, false,       
			byteLen, 17*4      
		);
		gl.vertexAttribPointer(	// 属性 7	TXR3
			7, 2, gl.FLOAT, false,       
			byteLen, 19*4      
		);
		
		// // 三角形を描く
		gl.drawArrays(gl.TRIANGLES, 0, curObj.mesh.faces.length*3); // 0から始まる3個の頂点　→　1個の三角形
		// 裏
		xID = gl.getUniformLocation(shader0, "revMd");
		gl.uniform1f(xID, -1.0);
		gl.drawArrays(gl.TRIANGLES, 0, curObj.mesh.faces.length*3); // 0から始まる3個の頂点　→　1個の三角形
		
		for(var i=0;i<8;i++)
			gl.disableVertexAttribArray(i);
 	

	}else if(curObj.mesh.dMode==1){
		gl.useProgram(shader3);
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuf[curObj.meshIdx]);
		
		xID = gl.getUniformLocation( shader3, "scl_rad" );
		gl.uniform2f(xID, curObj.scale, radius);
		xID = gl.getUniformLocation( shader3, "objRot" );
		gl.uniform3f(xID, curObj.rot.x, curObj.rot.y, curObj.rot.z);
		xID = gl.getUniformLocation( shader3, "objStd" );
		gl.uniform3f(xID, curObj.objStd.x, curObj.objStd.y, curObj.objStd.z);
		xID = gl.getUniformLocation( shader3, "locR" );
		gl.uniform3f(xID, curObj.locr.x, curObj.locr.y, curObj.locr.z);
			
		//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(curObj.pts2), gl.STATIC_DRAW);//転送

		//--
		// 最初の属性バッファ : 頂点
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(      
			0, 3, gl.FLOAT, false,       
			0, 0      
		);
		// 三角形を描く
		gl.drawArrays(gl.POINTS, 0, curObj.mesh.pts.length); // 0から始まる3個の頂点　→　1個の三角形
		gl.disableVertexAttribArray(0);
		//console.log(curObj.locr);
	}

 }
 return 0;

}

var obGetSW = false;
function obGet(uni, num){//, ts){
	var objData = null;
	//if(!ev) var ev = event;
	//ev.stopPropagation();
	 if(1){
		 //obGetSW = true;
		var xmlHttp = new XMLHttpRequest();
		
		xmlHttp.onreadystatechange = function(){
			if (xmlHttp.readyState == 4){		//=====ajax取得完了後の処理=====//
				if(xmlHttp.status == 200){
					objData = xmlHttp.responseText;
				}
				
				makeObj(objData, num);
	//init_on4();
				//obGetSW = false;
			}
		}
		xmlHttp.open("GET", 'obget.php?uni='+uni, true);		//----必要なtxtを取得
		xmlHttp.send(null);
	 }
}



// プレイヤーと他オブジェクト間の距離を描画
function DrawDistances()
{
	if (VIEW_DST)
	{
		var asp = 1.0 * WIDTH / HEIGHT;
		// GuiString guiStr;
		// guiStr.fontSz = 0.025;
		// guiStr.fontSpan = 0.8;
		// guiStr.padding.l = 0;
		// guiStr.padding.t = 0;

		//=====カメラの範囲
		var cRangeX = Math.tan(CR_RANGE_X * 0.5 * PIE / 180);
		var cRangeY = Math.tan(CR_RANGE_Y * 0.5 * PIE / 180);
		var pObj = camera;

		for (var h = 0; h < objs.length; h++) 	//-- 距離の表示
		{
			if (!objs[h].used) continue;
			var eObj = objs[h];

			var len = Math.tan(eObj.locr.y);
			var dx = len * Math.sin(eObj.locr.x);
			var dy = len * Math.cos(eObj.locr.x);

			var sPtX = (dx / cRangeX + 1.0) * 0.5;
			var sPtY = (dy / cRangeY + 1.0) * -0.5 + 1.0;

			//-- 画面内なら表示
			if ((0 < sPtX && sPtX < 1) && (0 < sPtY && sPtY < 1)) 
			{
				//-- 物体間の距離
				var pLoc = tudeToEuc(pObj.loc);
				var eLoc = tudeToEuc(eObj.loc);
				var val = Math.asin((pyth4(mns4(pLoc, eLoc)) * 0.5)) * 2 * radius;
				var dstR = String(val);
				var dstLen = (val < 100.0) ? 4 : 3;		// 有効桁数

				// canvas描画
				var ctx = document.getElementById('canvas2d').getContext('2d');
				ctx.font = "22px serif";
				ctx.fillStyle = "rgb(0, 0, 0)";
				ctx.fillText(dstR.substring(0, dstLen), sPtX * WIDTH, sPtY * HEIGHT);
				ctx.fillStyle = "rgb(255, 255, 255)";
				ctx.fillText(dstR.substring(0, dstLen), sPtX * WIDTH - 2, sPtY * HEIGHT - 2);
			}
		}
	}
}



var objs = [];
var meshs = [];

function makeObj(m, num){
	
	meshs[num] = {
		faces: [],
		fCol: [],
		pts: [],
		pts2: [],
		
		dMode: 1
	};
	
	
	if(m==1){
		
		meshs[num].pts.push(
							  {x:-1, y:-1, z:-1},	//===頂点設定 ▼
							  {x: 1, y:-1, z:-1},
							  {x:-1, y: 1, z:-1},
							  {x: 1, y: 1, z:-1},
							  {x:-1, y:-1, z: 1},
							  {x: 1, y:-1, z: 1},
							  {x:-1, y: 1, z: 1},
							  {x: 1, y: 1, z: 1}
		);
		var pIdx = []; cubePts(4, 0, 1, 5, pIdx, 2);
		
		var pCnt = 0; var Len = 6;
		for(var i=0;i<Len;i++){
			meshs[num].faces[i] = [];
			for(var j=0;j<3;j++) meshs[num].faces[i][j] = pIdx[pCnt+1+j];
			if(pIdx[pCnt]){ //console.log(meshs[num].faces[i]);
				++i; ++Len;
				meshs[num].faces[i] = [];
				for(var j=0;j<3;j++) {meshs[num].faces[i][j] = pIdx[pCnt+1+(2+j)%4];}
			}
			pCnt += 4+pIdx[pCnt];
		}
			meshs[num].fCol[0] = 		{ R:255, G:0, B:0};		//色設定
			meshs[num].fCol[0+1] = 	{ R:255, G:0, B:0};		//色設定
			meshs[num].fCol[1*2] = 	{ R:255, G:255, B:0};		//色設定
			meshs[num].fCol[1*2+1] = { R:255, G:255, B:0};		//色設定
			meshs[num].fCol[2*2] = 	{ R:255, G:255, B:255};		//色設定
			meshs[num].fCol[2*2+1] = { R:255, G:255, B:255};		//色設定
			meshs[num].fCol[3*2] = 	{ R:0,		G:255, B:0};		//色設定
			meshs[num].fCol[3*2+1] = { R:0, 		G:255, B:0};		//色設定
			meshs[num].fCol[4*2] = 	{ R:0, 		G:0, B:255};		//色設定
			meshs[num].fCol[4*2+1] = { R:0, 		G:0, B:255};		//色設定
			meshs[num].fCol[5*2] =		{ R:255, 	G:0, B:255};		//色設定
			meshs[num].fCol[5*2+1] = { R:255, 	G:0, B:255};		//色設定
			

	}else{
		//ファイルオープン(作成)
		//FILE *fp, *fpM;
		var objStr;
		var datStr;
		var mtlName = null;
		var mtlStr = [];
		//char *tp;
		var vQty = 0, fQty = 0;

		var om = m.split( String.fromCharCode(11) );
		var objData = om[0];
		var mtlData = om[1];
		var datData = om[2];
		if(objData == null){
			alert(".objファイルが見つかりません");
		}
		//まずv, fをカウント, mtlファイル名確認 (roop1)
		objStr = objData.split( String.fromCharCode(9));
		while( objStr.length >= 2 ){
			var fvCnt = objStr[0].split(' ');
			
			if(fvCnt[0]=='v') ++vQty;
			else if(fvCnt[0]=='f') fQty += fvCnt.length - 3;
			else if(fvCnt[0] == "mtllib") mtlStr = fvCnt[0];
			
			objStr.shift();
		} 
		
		//マテリアルファイル (マテルroop1)
		var mtlQty = 0, mtlSum = 0;
		if(mtlName!=null){
			if(mtlData == null){
				alert(".mtlファイルが見つかりません");
				mtlName = null;
			}
			mtlStr = mtlData.split( String.fromCharCode(9));
			while( mtlStr.length >= 2 ){
				var mtCnt = mtlStr[0].split(' ');
				if(mtCnt[0] == "newmtl") ++mtlQty;
				mtlStr.shift();
			}
		}
		//動的確保
		var matels = [];
		mtlSum = mtlQty;
		vQty = fQty = 0;
		mtlQty = -1;

		// (マテルroop2)
		var curMtl = '#hdr#';
		matels[curMtl] = [];
		if(mtlName!=""){
			mtlStr = mtlData.split( String.fromCharCode(9));
			while( mtlStr.length >= 2 ){
				var mtCnt = mtlStr[0].split(' ');
				if(mtCnt[0] == "newmtl"){
					matels[mtCnt[1]] = [];
					curMtl = mtCnt[1];
				}else{
					matels[curMtl][mtCnt[0]] = { R:mtCnt[1], G:mtCnt[2], B:mtCnt[3] };
				}
				mtlStr.shift();
			}
		}
		//頂点データの格納 (roop2)
		objStr = objData.split( String.fromCharCode(9));
		while( objStr.length >= 2 ){
			var fvCnt = objStr[0].split(' ');
			if(fvCnt[0]=='v'){
				meshs[num].pts[vQty] = {
					x : Number( fvCnt[1] ),
					y : Number( fvCnt[2] ),
					z : Number( fvCnt[3] )
				};
				++vQty;
			}
			objStr.shift();
		}
		//面データの格納 (roop3)
		var mtlName = -1;
		objStr = objData.split( String.fromCharCode(9));
		while( objStr.length >= 2 ){
			var fvCnt = objStr[0].split(' ');
			
			if(fvCnt[0]=="usemtl") mtlName = fvCnt[1];
			else if(fvCnt[0]=='f'){

				var rgb = { R:200, G:200, B:200 };
				if(matels[mtlName]['Kd']){
					rgb[0] = matels[mtlName]['Kd'].R*255;
					rgb[1] = matels[mtlName]['Kd'].G*255;
					rgb[2] = matels[mtlName]['Kd'].B*255;
					meshs[num].fCol[fQty] = { R:rgb[0], G:rgb[1], B:rgb[2] };
				}
				//-- 面の頂点
				meshs[num].faces[fQty] = [];
				meshs[num].faces[fQty][0] = Number( fvCnt[1].split('/')[0] )-1;
				meshs[num].faces[fQty][1] = Number( fvCnt[2].split('/')[0] )-1;
				meshs[num].faces[fQty][2] = Number( fvCnt[3].split('/')[0] )-1;
				
				var alf = 0;
				while(3+alf < fvCnt.length-1){
					++fQty; ++alf;
					meshs[num].faces[fQty] = [];
					meshs[num].faces[fQty][0] = Number( fvCnt[1].split('/')[0] )-1;
					meshs[num].faces[fQty][1] = Number( fvCnt[2+alf].split('/')[0] )-1;
					meshs[num].faces[fQty][2] = Number( fvCnt[3+alf].split('/')[0] )-1;
					meshs[num].fCol[fQty] = { R:rgb[0], G:rgb[1], B:rgb[2] };
				};
				++fQty;
			}
			objStr.shift();
		}
		//delete[] mtlNames;
		
		//-- dat情報
		datStr = datData.split( String.fromCharCode(9));
		while( datStr.length >= 2 ){
			var dt = datStr[0].split(' ');
			 
			if(dt[0]=='dMode') meshs[num].dMode = Number(dt[1]);
			// else if(dt[0]=='scale') objs[num].scale = Number(dt[1]);
			// else if(dt[0] == "loc") objs[num].loc = { x: Number(dt[1])*PIE, y: Number(dt[2])*PIE, z: Number(dt[3])*PIE };
			// else if(dt[0] == "lspX") objs[num].lspX = { w: Number(dt[1]), x: Number(dt[2])*PIE, y: Number(dt[3])*PIE, z: Number(dt[4])*PIE };
			// else if(dt[0] == "rot") objs[num].rot = { x: Number(dt[1])*PIE, y: Number(dt[2])*PIE, z: Number(dt[3])*PIE };
			// else if(dt[0] == "rsp") objs[num].rsp = { x: Number(dt[1])*DEG, y: Number(dt[2])*DEG, z: Number(dt[3])*DEG };
			
			datStr.shift();
		} 
	}
	
	 //-- 超球表面空間 (緯度・軽度・深度)--//
	 for(var i=0;i<meshs[num].pts.length;i++){
		  var tmpt = {
			  x: Math.atan2(meshs[num].pts[i].x, meshs[num].pts[i].y),		//--方向1
			  y: Math.atan2(pyth2(meshs[num].pts[i].x, meshs[num].pts[i].y), meshs[num].pts[i].z),	//--方向2
			  z: pyth3o(meshs[num].pts[i])	//--距離(長さ)
		  }
		  
		  
		  meshs[num].pts[i] = {x:tmpt.x, y:tmpt.y, z:tmpt.z};
	 }
	 
	 if(meshs[num].dMode==1){ 
		  for(var i=0;i<meshs[num].pts.length;i++){
			  var idx = 3*i;
			  meshs[num].pts2[idx +0] = meshs[num].pts[i].x;
			  meshs[num].pts2[idx +1] = meshs[num].pts[i].y;
			  meshs[num].pts2[idx +2] = meshs[num].pts[i].z;
		  }
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuf[num])
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshs[num].pts2), gl.STATIC_DRAW);//転送
	 }
	 else if(meshs[num].dMode == 3)
	 {
		 //console.log(m);
		 
		for(var i=0;i<meshs[num].faces.length;i++)
		{
			for(var j=0;j<3;j++)
			{
				var idx = 21*(i*3 +1*j);
				
			  meshs[num].pts2[idx +0] = meshs[num].pts[ meshs[num].faces[i][j] ].x;	//-- 属性0 頂点 
			  meshs[num].pts2[idx +1] = meshs[num].pts[ meshs[num].faces[i][j] ].y;	//
			  meshs[num].pts2[idx +2] = meshs[num].pts[ meshs[num].faces[i][j] ].z;	//
			  
			  meshs[num].pts2[idx +3] = meshs[num].fCol[i].R / 256.0;	//-- 属性1 カラー 
			  meshs[num].pts2[idx +4] = meshs[num].fCol[i].G / 256.0;	//
			  meshs[num].pts2[idx +5] = meshs[num].fCol[i].B / 256.0;	//
			  
			  meshs[num].pts2[idx +6] = meshs[num].pts[ meshs[num].faces[i][0] ].x;	//-- 属性2 頂点 1
			  meshs[num].pts2[idx +7] = meshs[num].pts[ meshs[num].faces[i][0] ].y;	//
			  meshs[num].pts2[idx +8] = meshs[num].pts[ meshs[num].faces[i][0] ].z;	//
				
			  meshs[num].pts2[idx +9] = meshs[num].pts[ meshs[num].faces[i][1] ].x;	//-- 属性3 頂点 2
			  meshs[num].pts2[idx +10] = meshs[num].pts[ meshs[num].faces[i][1] ].y;	//
			  meshs[num].pts2[idx +11] = meshs[num].pts[ meshs[num].faces[i][1] ].z;	//
			  
			  meshs[num].pts2[idx +12] = meshs[num].pts[ meshs[num].faces[i][2] ].x;	//-- 属性4 頂点 3 
			  meshs[num].pts2[idx +13] = meshs[num].pts[ meshs[num].faces[i][2] ].y;	//
			  meshs[num].pts2[idx +14] = meshs[num].pts[ meshs[num].faces[i][2] ].z;	//
			  
			  meshs[num].pts2[idx +15] = //meshs[num].pts[ meshs[num].faces[i][2] ].x;	//-- 属性5 頂点 1
			  meshs[num].pts2[idx +16] = //meshs[num].pts[ meshs[num].faces[i][2] ].y;	//
			  
			  meshs[num].pts2[idx +17] = //meshs[num].pts[ meshs[num].faces[i][2] ].x;	//-- 属性6 頂点 2
			  meshs[num].pts2[idx +18] = //meshs[num].pts[ meshs[num].faces[i][2] ].y;	//
			  
			  meshs[num].pts2[idx +19] = //meshs[num].pts[ meshs[num].faces[i][2] ].x;	//-- 属性7 頂点 3
			  meshs[num].pts2[idx +20] = //meshs[num].pts[ meshs[num].faces[i][2] ].y;	//
															0;
			}
			
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuf[num])
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshs[num].pts2), gl.STATIC_DRAW);//転送
	 }
	  ++ldObj;
}


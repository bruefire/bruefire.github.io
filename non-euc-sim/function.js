
function pyth2( x,  y){ return Math.sqrt(Math.pow(x,2.0)+Math.pow(y,2.0)); }
function pyth3( x,  y,  z){ return Math.sqrt(Math.pow(x,2.0)+Math.pow(y,2.0)+Math.pow(z,2.0)); }
function pyth4( pt4 )
{ 
	return Math.sqrt( Math.pow(pt4.x, 2.0) + Math.pow(pt4.y, 2.0) + Math.pow(pt4.z, 2.0) + Math.pow(pt4.w, 2.0) ); 
}
function pyth3o( obj ){ return Math.sqrt(Math.pow(obj.x,2.0)+Math.pow(obj.y,2.0)+Math.pow(obj.z,2.0)); }

function tudeRst(vec1, vec2, locT, mode){//-- 緯,経,深リセット回転
	
	var tRot = Math.atan2(vec1, vec2);

	var R = pyth2(vec1, vec2);
	if(!mode){
		vec1 = R * Math.sin(tRot - locT);
		vec2 = R * Math.cos(tRot - locT);
	}else{
		vec1 = R * Math.sin(tRot + locT);
		vec2 = R * Math.cos(tRot + locT);
	}
	return [vec1, vec2];

}
function tudeRst2(vec, prp1, prp2, locT, mode){
	var t = tudeRst(vec[prp1], vec[prp2], locT, mode);
	vec[prp1] = t[0], vec[prp2] = t[1];
}
function all_tudeRst(vec, locT, mode){//-- 緯,経,深リセット回転
	var t;
	if(mode==0){//-- 緯度,経度,深度を0に
		tudeRst2(vec, "x", "y", locT.x, 0);//-- X-Y 回転
		tudeRst2(vec, "y", "z", locT.y, 0);//-- Y-Z 回転
		tudeRst2(vec, "z", "w", locT.z, 0);//-- Z-W 回転
	}else if(mode==1){		//-- 緯度,経度,深度を戻す
		tudeRst2(vec, "z", "w", locT.z, 1); //-- Z-W 回転
		tudeRst2(vec, "y", "z", locT.y, 1); //-- Y-Z 回転
		tudeRst2(vec, "x", "y", locT.x, 1); //-- X-Y 回転
	}
}

function clcStd( std1, std2, rotStd){//-- 基準方向1,2,3の特定

	var tVec = {w:std2.w, x:std2.x, y:std2.y, z:std2.z};
	rotStd[0] = Math.atan2(std1.x, std1.y);					//-方向1の特定
	rotStd[1] = Math.atan2(pyth2(std1.x, std1.y), std1.z);	//-方向2の特定
	//-- 3特定の際、基準2cpyの基準方向1,2を0に
	tudeRst2(tVec, "x", "y", rotStd[0], 0);//-- X-Y 回転 (基準2cpy
	tudeRst2(tVec, "y", "z", rotStd[1], 0);//-- Y-Z 回転 (基準2cpy
	rotStd[2] = Math.atan2(tVec.x, tVec.y);	//-方向3の特定
}
function clcSlope4( tmPt_0, tmPt_1, slopeC, betaC){	//-- 4次元直線の傾きを計算
	var drawP1 = tudeToEuc(tmPt_0);
	var drawP2 = tudeToEuc(tmPt_1);
	//-- 計算を安易にする補正
	var tmpt2 = drawP2;
	all_tudeRst(tmpt2, tmPt_0, 0);
	//-- 進行方向1,2の特定
	var rotEn = [];
	rotEn[0] = Math.atan2(tmpt2.x, tmpt2.y);
	rotEn[1] = Math.atan2(pyth2(tmpt2.x, tmpt2.y), tmpt2.z);
	//--
	var gen1 = {w:1.0, x:0.0, y:0.0, z:0.0};
	tudeRst2(gen1, "z", "w", 1.0, 1);
	tudeRst2(gen1, "y", "z", rotEn[1], 1);
	tudeRst2(gen1, "x", "y", rotEn[0], 1);
	all_tudeRst(gen1, tmPt_0, 1);
	//--
	//	adjY4(&drawP1, gen1);	//--値調整
	slopeC.x = (drawP1.x-gen1.x)/(drawP1.y-gen1.y);
	slopeC.z = (drawP1.z-gen1.z)/(drawP1.y-gen1.y);
	slopeC.w = (drawP1.w-gen1.w)/(drawP1.y-gen1.y);
	betaC.x = drawP1.x-(slopeC.x*drawP1.y);
	betaC.z = drawP1.z-(slopeC.z*drawP1.y);
	betaC.w = drawP1.w-(slopeC.w*drawP1.y);
}

function tudeToEuc( locT){	// [緯,経,深]座標を[XYZ]W座標に変換
	var vecT = { w:Math.cos(locT.z),		//W
						 x:Math.sin(locT.z) * Math.sin(locT.y) * Math.sin(locT.x),//X
						 y:Math.sin(locT.z) * Math.sin(locT.y) * Math.cos(locT.x),//Y
						 z:Math.sin(locT.z) * Math.cos(locT.y) };//Z

	return vecT;
}
function eucToTude( vecT){	// [XYZ]W座標を[緯,経,深]座標に変換
	var locT = {
		x: Math.atan2(vecT.x, vecT.y),			
		y: Math.atan2(pyth2(vecT.x,vecT.y), vecT.z),	
		z: Math.atan2(pyth3(vecT.x,vecT.y,vecT.z), vecT.w)
	}
	return locT;
}
function cubePts( p1,  p2,  p3,  p4, idxs, len)
{
	for(var i=0;i<6;i++) idxs[i*5] = 1;
	idxs[1] = p1, idxs[2] = p2, idxs[3] = p3, idxs[4] = p4;
	idxs[6] = p4, idxs[7] = p3, idxs[8] = p3+len, idxs[9] = p4+len;
	idxs[11] = p4+len, idxs[12] = p3+len, idxs[13] = p2+len, idxs[14] = p1+len;
	idxs[16] = p1+len, idxs[17] = p2+len, idxs[18] = p2, idxs[19] = p1;
	idxs[21] = p2, idxs[22] = p2+len, idxs[23] = p3+len, idxs[24] = p3;
	idxs[26] = p1+len, idxs[27] = p1, idxs[28] = p4, idxs[29] = p4+len;

}

// objのランダム配置 (S3)
function RandLoc() {
	
	//-- 放出オブジェクト ------
	for (var num = getRngObjLen(objIdx.shoot); num<getRngObjLen(objIdx.shoot +1); num++)
	{
		objs[num].loc = randLoc2(0);
		var tmp = randLoc2(0);
		objs[num].lspX = { w: PLR_SPEED, x: tmp.x, y: tmp.y, z: tmp.z };
			
		objs[num].fc = {w:0, x:0, y:0, z:0};	//必要?
		objs[num].used = true;	//-- 有効化
		//objs[h].markInitS3(radius);
	}
	init_std(getRngObjLen(objIdx.shoot), getRngObjLen(objIdx.shoot +1));	//-- std

	return 0;
}

//-- objのランダム配置2
function randLoc2(cnt) {	

	//-- 放出オブジェクト ------

		//-- 一様乱数
	var rnd = 
	{
		w: (Math.random() * 2.0 - 1.0),
		x: (Math.random() * 2.0 - 1.0),
		y: (Math.random() * 2.0 - 1.0),
		z: (Math.random() * 2.0 - 1.0)
	};
	if (
		(pyth4(rnd) > 1.0) && cnt != 100
		) 
	{
		return randLoc2(cnt + 1);
	}
	else 
	{
		return eucToTude(rnd);
	}
}

// 減算4
function mns4(pts1, pts2)
{
	return {w:pts1.w-pts2.w, x:pts1.x-pts2.x, y:pts1.y-pts2.y, z:pts1.z-pts2.z};
}




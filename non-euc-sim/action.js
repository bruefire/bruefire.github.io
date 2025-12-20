


// 射撃
function shoot()
{
	for(var h=getRngObjLen(objIdx.shoot);h<getRngObjLen(objIdx.shoot +1);h++)
	{
		if(objs[h].used==false)
		{
			objs[h].loc = camera.loc;
			objs[h].std[0] = camera.std[0];
			objs[h].std[1] = camera.std[1];
			objs[h].lspX = camera.std[0];
			objs[h].lspX.w = 0.2;
			
			objs[h].used = true;
			break;
		}
	}
}

// 射撃オブジェクトをクリア
function DisableShootObjs()
{
	for(var h=getRngObjLen(objIdx.shoot);h<getRngObjLen(objIdx.shoot +1);h++)
	{
		objs[h].used = false;
	}
}

// 超球半径変更
function ChangeRadius(ts)
{
	radius = ts.value;
}

// 視界変更
function ChangeVRange(ts)
{
	CR_RANGE_X = ts.value * 1.0;
	CR_RANGE_Y = Math.atan( Math.tan((CR_RANGE_X)/2*PIE/180)*HEIGHT/WIDTH ) *2/PIE*180;	//カメラ設定
}

// 速度変更
function ChangePlrSpd()
{
	spdMtp = (spdMtp + 1) % 3;
}

// 距離表示/非表示
function ChangeDstView()
{
	VIEW_DST = !VIEW_DST;
}

// 陰影モード変更
function ChangeDecMode(value)
{
	decMode = value;
}
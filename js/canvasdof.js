var canvasA , canvasB;
var ctxA , ctxB;

function setCanvasById(nameA, nameB) {
	canvasA = document.getElementById(nameA);
	ctxA = canvasA.getContext("2d");
	canvasB = document.getElementById(nameB);
	ctxB = canvasB.getContext("2d");
}

function noEffect() {
	var imgData = ctxA.getImageData(0, 0, canvasA.width, canvasA.height);
	ctxB.putImageData(imgData, 0, 0, 0, 0, canvasB.width, canvasB.height);
}

function depthOfFieldEffect(fnumber, focus, gamma=2.2) {
	var imgData = ctxA.getImageData(0, 0, canvasA.width, canvasA.height);
	var pxData = imgData.data;
	var tmpPxArr = [];
	var radius = [], ratio = [], dist = [];
	var fullH = canvasB.height, fullW = canvasB.width;
	var halfH = (fullH-1)*0.5, halfW = (fullW-1)*0.5;
	var halfH_Re = 1 / halfH, halfW_Re = 1 / halfW;
	var halfD_Re = 1 / Math.sqrt(halfW*halfW + halfH*halfH);
	if (typeof(centerX) == "undefined") centerX = halfW;
	else centerX *= fullW - 1;
	if (typeof(centerY) == "undefined") centerY = halfH;
	else centerY *= fullH - 1;
	var minZ = 255, maxZ = 0;
	for (var i = 0; i < fullH; i++)
		for (var j = 0; j < fullW; j++) {
			var p = (i*fullW + j)<<2;
			tmpPxArr[p] = Math.exp(Math.log(pxData[p]/255) * gamma);
			tmpPxArr[p|1] = Math.exp(Math.log(pxData[p|1]/255) * gamma);
			tmpPxArr[p|2] = Math.exp(Math.log(pxData[p|2]/255) * gamma);
			tmpPxArr[p|3] = pxData[p|3];
			if (pxData[p|3] < minZ) minZ = pxData[p|3];
			if (pxData[p|3] > maxZ) maxZ = pxData[p|3];
		}
	var maxRadius = 0;
	for (var i = minZ; i <= maxZ; i++) {
		radius[i] = Math.abs(i/255 - focus) * 20 / fnumber;
		ratio[i] =  1/(radius[i]+0.5)/(radius[i]+0.5)/Math.PI;
		if (radius[i] > maxRadius) maxRadius = radius[i];
	}
	var maxRadius_=Math.ceil(maxRadius);
	
	gamma = 1 / gamma;
	
	for (var i = 0; i < fullH; i++)
		for (var j = 0; j < fullW; j++) {
			var p = (i*fullW + j)<<2;
			var totalW2  = 0, totalR2 = 0, totalG2 = 0, totalB2 = 0;  // above
			var totalW1 = 0, totalR1 = 0, totalG1 = 0, totalB1 = 0;  // at
			var totalW0 = 0, totalR0 = 0, totalG0 = 0, totalB0 = 0;  // below
			var totalW_ = 0, totalR_ = 0, totalG_ = 0, totalB_ = 0;  // background
			var searchR_x = maxRadius_;
			var xbegin = i-searchR_x>=0 ? -searchR_x : -i, xend = i+searchR_x<fullH ? searchR_x : fullH-i-1;
			for (var dx = xbegin; dx <= xend; dx++) {
				var searchR_y = Math.ceil(Math.sqrt(maxRadius*maxRadius - dx*dx));
				var ybegin = j-searchR_y>=0 ? -searchR_y : -j, yend = j+searchR_y<fullW ? searchR_y : fullW-j-1;
				for (var dy = ybegin; dy <= yend; dy++) {
					var pp = ((i+dx)*fullW + j+dy)<<2;
					var blurR = radius[tmpPxArr[pp|3]];
					var distance = Math.sqrt(dx*dx + dy*dy);
					if (tmpPxArr[pp|3] > tmpPxArr[p|3]) {  // above
						if (distance > blurR+1) continue;
						var ratioR = ratio[tmpPxArr[pp|3]];
						var wt = distance<blurR ? ratioR : (blurR+1-distance)*ratioR; 
						totalW2 += wt;
						totalR2 += tmpPxArr[pp] * wt;
						totalG2 += tmpPxArr[pp|1] * wt;
						totalB2 += tmpPxArr[pp|2] * wt;
					}
					else if (tmpPxArr[pp|3] == tmpPxArr[p|3]) {  // at
						if (totalW2 >= 1 || distance > blurR+1) continue;
						var ratioR = ratio[tmpPxArr[p|3]];
						var wt = distance<blurR ? ratioR : (blurR+1-distance)*ratioR; 
						totalW1 += wt;
						totalR1 += tmpPxArr[pp] * wt;
						totalG1 += tmpPxArr[pp|1] * wt;
						totalB1 += tmpPxArr[pp|2] * wt;
					}
					else {  // below
						blurR = radius[tmpPxArr[p|3]];
						if (totalW2 + totalW1 >= 1 || distance > blurR+1) continue;
						var ratioR = ratio[tmpPxArr[p|3]];
						var wt = distance<blurR ? ratioR : (blurR+1-distance)*ratioR;
						totalW0 += wt;
						totalR0 += tmpPxArr[pp] * wt;
						totalG0 += tmpPxArr[pp|1] * wt;
						totalB0 += tmpPxArr[pp|2] * wt;
					}
				}
			}
			if (totalW2 > 1) {
				totalR2 /= totalW2;
				totalG2 /= totalW2;
				totalB2 /= totalW2;
				totalW2 = 1;
			}
			if (totalW1 > 1-totalW2) {
				totalR1 = totalR1 * (1-totalW2) / totalW1
				totalG1 = totalG1 * (1-totalW2) / totalW1
				totalB1 = totalB1 * (1-totalW2) / totalW1
				totalW1 = 1-totalW2
			}
			if (totalW0 > 1-totalW2-totalW1) {
				totalR0 = totalR0 * (1-totalW2-totalW1) / totalW0
				totalG0 = totalG0 * (1-totalW2-totalW1) / totalW0
				totalB0 = totalB0 * (1-totalW2-totalW1) / totalW0
				totalW0 = 1-totalW2-totalW1
			}
			pxData[p] = Math.exp(Math.log((totalR2+totalR1+totalR0)/(totalW2+totalW1+totalW0)) * gamma) * 255;
			pxData[p|1] = Math.exp(Math.log((totalG2+totalG1+totalG0)/(totalW2+totalW1+totalW0)) * gamma) * 255;
			pxData[p|2] = Math.exp(Math.log((totalB2+totalB1+totalB0)/(totalW2+totalW1+totalW0)) * gamma) * 255;
			pxData[p|3] = 255;
		}

	ctxB.putImageData(imgData, 0, 0, 0, 0, fullW, fullH);
}

/*	
	// a circle random method just for referring
	var r = Math.pow(Math.random(),0.5) * radius;
	var theta = Math.random()*2*Math.PI;
	var dx = Math.cos(theta)*r;
	var dy = Math.sin(theta)*r;
*/
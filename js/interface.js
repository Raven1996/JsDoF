var scaleType = 1  // 0:100% 1:auto

window.onresize = function(){
	scaleCanvas()
}

function setScaleType(type){
	scaleType = type
	scaleCanvas()
}

window.onload = function(){
			var image = new Image()
			setCanvasById('canvashidden', 'canvasshow')	 // before using canvasfx function
			image.src = 'img/tid.png'	// sample image is from http://www.polayoutu.com/collections/4
			image.onload = function(){
				canvasA.setAttribute('width', image.width)
				canvasA.setAttribute('height', image.height)
				canvasB.setAttribute('width', image.width)
				canvasB.setAttribute('height', image.height)
				ctxA.drawImage(image, 0, 0)
				resetValues()
				updateValues()
				noEffect()
				setScaleType(1)
			}
			var holder = document.getElementById('drop')
			holder.ondragenter = function(){
				holder.className = 'hover'
				return false
			}
			holder.ondragleave = function(){
				holder.className = ''
				return false
			}
			holder.ondragover = function(){
				return false  // otherwise the page will be replaced by the image
			}
			holder.ondrop = function(e){
				e.preventDefault()
				e.stopPropagation()
				holder.className = ''
				var file = e.dataTransfer.files[0]
				importFile(file)
				return false
			}
		}

function scaleCanvas(){
	var span = document.getElementById('imgspan')
	var width = span.offsetWidth - 16
	var height = span.offsetHeight - 16
	var ratio = 0
	var type = scaleType
	height/canvasB.height > width/canvasB.width ? ratio = width/canvasB.width : ratio = height/canvasB.height
	if(scaleType == 1){
		ratio > 1 ? type = 0 : type = 1
	}
	type == 0 ? canvasB.style.width = canvasB.width+'px' : canvasB.style.width = canvasB.width*ratio+'px'
	type == 0 ? canvasB.style.height = canvasB.height+'px' : canvasB.style.height = canvasB.height*ratio+'px'
}

function exportImg(){ 
	// here is the most important part because if you dont replace you will get a DOM 18 exception.
	var image = canvasB.toDataURL('image/png').replace('image/png', 'image/octet-stream')
	var save = document.getElementById('saveimage');
	save.href = image
	save.type = 'image/png'
	save.download = 'IMG.png'
	save.click()
}

function importImg(){
	var input = document.getElementById('importfile')
	var file = input.files[0]
	importFile(file)
	input.value=''
}

function importFile(file){
	var reader = new FileReader()
	reader.onload = function(event){
		img = new Image()
		img.src = event.target.result
		img.onload = function(){
			canvasA.setAttribute('width', this.width)
			canvasA.setAttribute('height', this.height)
			canvasB.setAttribute('width', this.width)
			canvasB.setAttribute('height', this.height)
			ctxA.clearRect(0, 0, this.width, this.height)
			ctxA.drawImage(this, 0, 0)
			delete this
			resetValues()
			updateValues()
			noEffect()
			setScaleType(1)
		}
	}
	reader.readAsDataURL(file)
}

function resetValues(){
	var div = document.getElementsByClassName("div")
	div[0].value="3.5"
	div[1].value="0.5"
	div[2].value="2.2"
}

function updateValues(){
	var div = document.getElementsByClassName("div")
	var value = document.getElementsByClassName("value")
	value[0].innerText=(1*div[0].value).toFixed(1)
	value[1].innerText=(1/(1-div[1].value)).toFixed(2)
	value[2].innerText=(1*div[2].value).toFixed(1)
}

function previewCanvas(){
	var div = document.getElementsByClassName("div")
	depthOfFieldEffect(parseFloat(div[0].value),
				parseFloat(1-div[1].value),
				parseFloat(div[2].value))
}






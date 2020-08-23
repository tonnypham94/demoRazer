import React, { useEffect, useState, useCallback } from 'react'
import './App.css'
import helloImg from './img/hello.svg'

function App() {

  const canvasRef = React.useRef(null)
  const closeEnough = 10
  const imageSize = {
    w: 200,
    h: 200
  }
  const [rect, setRect] = useState({
    startX: 100,
    startY: 200,
    w: 400,
    h: 200
  })
  const [onDrag, setOnDrag] = useState(false)
  const [positionOnRectangle, setPositionOnRectangle] = useState({X: 0, Y: 0})
  const [dragTL, setDragTL] = useState(false)
  const [dragBL, setDragBL] = useState(false)
  const [dragTR, setDragTR] = useState(false)
  const [dragBR, setDragBR] = useState(false)
  const [inputTop, setInputTop] = useState()
  const [inputLeft, setInputLeft] = useState()
  const [inputWidth, setInputWidth] = useState()
  const [inputHeight, setInputHeight] = useState()
  const [addText, setAddText] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus laoreet pretium ligula, quis cursus metus molestie a. Suspendisse pretium semper eros, et faucibus augue facilisis ut.')

  const drawCircle = (x, y, radius, ctx) => {
    ctx.fillStyle = "#FF0000"
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawHandles = (ctx) => {
    drawCircle(rect.startX, rect.startY, closeEnough, ctx)
    drawCircle(rect.startX + rect.w, rect.startY, closeEnough, ctx)
    drawCircle(rect.startX + rect.w, rect.startY + rect.h, closeEnough, ctx)
    drawCircle(rect.startX, rect.startY + rect.h, closeEnough, ctx)
  }

  const wrapText = (ctx, text, x, y, lineHeight) => {
    let words = text.split(' ');
    let line = '';

    for(let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' '
      let metrics = ctx.measureText(testLine)
      let testWidth = metrics.width
      if ((y + lineHeight) < (rect.h + rect.startY)) {
        if (testWidth > rect.w - imageSize.w && n > 0) {
          ctx.fillText(line, x, y)
          line = words[n] + ' '
          y += lineHeight
        }
        else {
          line = testLine
        }
      }
    }

    ctx.fillText(line, x, y)
  }
  
  const draw = (ctx) => {
    ctx.fillStyle = "#222222"
    ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h)
    drawHandles(ctx)
    var img = document.getElementById("helloImage")
    if (addText) {
      ctx.font = "20px Arial"
      wrapText(ctx, addText, rect.startX + imageSize.w, rect.startY + 25, 25)
    }
    if (rect.w < imageSize.w && rect.h < imageSize.h) {
      ctx.drawImage(img, rect.startX, rect.startY, rect.w, rect.h)
    } else if (rect.w < imageSize.w) {
      ctx.drawImage(img, rect.startX, rect.startY, rect.w, imageSize.h)
    } else if (rect.h < imageSize.h) {
      ctx.drawImage(img, rect.startX, rect.startY, imageSize.w, rect.h)
    } else {
      ctx.drawImage(img, rect.startX, rect.startY, imageSize.w, imageSize.h)
    }
  }

  const mouseDown = (e) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let mouseMoveX = e.pageX - canvas.offsetLeft
    let mouseMoveY = e.pageY - canvas.offsetTop

    // if there isn't a rect yet
    if (rect.w === undefined) {
      setRect({
        ...rect,
        startX: mouseMoveY,
        startY: mouseMoveX,
      })
      setDragBR(true)
    }

    else if (mouseMoveX > rect.startX && mouseMoveX < rect.startX +
      rect.w && mouseMoveY > rect.startY &&
      mouseMoveY < rect.startY + rect.h){
        setPositionOnRectangle({
          X: mouseMoveX - rect.startX,
          Y: mouseMoveY - rect.startY
        })
        setOnDrag(true)
    }

    // if there is, check which corner
    //   (if any) was clicked
    //
    // 4 cases:
    // 1. top left
    else if (checkCloseEnough(mouseMoveX, rect.startX) && checkCloseEnough(mouseMoveY, rect.startY)) {
      setDragTL(true)
    }
    // 2. top right
    else if (checkCloseEnough(mouseMoveX, rect.startX + rect.w) && checkCloseEnough(mouseMoveY, rect.startY)) {
      setDragTR(true)
    }
    // 3. bottom left
    else if (checkCloseEnough(mouseMoveX, rect.startX) && checkCloseEnough(mouseMoveY, rect.startY + rect.h)) {
      setDragBL(true)
    }
    // 4. bottom right
    else if (checkCloseEnough(mouseMoveX, rect.startX + rect.w) && checkCloseEnough(mouseMoveY, rect.startY + rect.h)) {
      setDragBR(true)
    }
    // (5.) none of them
    else {
        // handle not resizing
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw(ctx)
  }

  function checkCloseEnough(p1, p2) {
    return Math.abs(p1 - p2) < closeEnough;
  }

  function mouseUp() {
    setOnDrag(false)
    setDragTL(false)
    setDragBL(false)
    setDragTR(false)
    setDragBR(false)
  }

  const mouseMove = (e) => {
    const canvas = canvasRef.current  
    const ctx = canvas.getContext('2d')
    let mouseMoveX = e.pageX - canvas.offsetLeft
    let mouseMoveY = e.pageY - canvas.offsetTop
    let getDataRect = rect
    if (onDrag) {
      getDataRect.startX = mouseMoveX - positionOnRectangle.X
      getDataRect.startY = mouseMoveY - positionOnRectangle.Y
    } else if (dragTL) {
      getDataRect.w += getDataRect.startX - mouseMoveX
      getDataRect.h += getDataRect.startY - mouseMoveY
      getDataRect.startX = mouseMoveX
      getDataRect.startY = mouseMoveY
    } else if (dragTR) {
      getDataRect.w = Math.abs(getDataRect.startX - mouseMoveX)
      getDataRect.h += getDataRect.startY - mouseMoveY
      getDataRect.startY = mouseMoveY
    } else if (dragBL) {
      getDataRect.w += getDataRect.startX - mouseMoveX
      getDataRect.h = Math.abs(getDataRect.startY - mouseMoveY)
      getDataRect.startX = mouseMoveX
    } else if (dragBR) {
      getDataRect.w = Math.abs(getDataRect.startX - mouseMoveX)
      getDataRect.h = Math.abs(getDataRect.startY - mouseMoveY)
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw(ctx)
    setRect(getDataRect)
  }

  const handleChangetop = (e) => {
    setInputTop(e.target.value)
  }

  const handleChangeLeft = (e) => {
    setInputLeft(e.target.value)
  }

  const handleChangeWidth = (e) => {
    setInputWidth(e.target.value)
  }

  const handleChangeHeight = (e) => {
    setInputHeight(e.target.value)
  }

  const handleChangeText = (e) => {
    setAddText(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setRect({
      startX: Number(inputTop),
      startY: Number(inputLeft),
      w: Number(inputWidth),
      h: Number(inputHeight)
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    draw(ctx)
    canvas.addEventListener('mousedown', mouseDown)
    canvas.addEventListener('mousemove', mouseMove)
    canvas.addEventListener('mouseup', mouseUp)
    return () => {
      canvas.removeEventListener('mousedown', mouseDown)
      canvas.removeEventListener('mousemove', mouseMove)
      canvas.removeEventListener('mouseup', mouseUp)
    }
  })

  return (
    <div className="App">
      <form className="Option" onSubmit={handleSubmit}>
        <label className="Height">
          <div>Top: </div>
          <input type="number" value={inputTop} onChange={handleChangetop} />
        </label>
        <label className="Height">
          <div>Left: </div>
          <input type="number" value={inputLeft} onChange={handleChangeLeft} />
        </label>
        <label className="Height">
          <div>Width: </div>
          <input type="number" value={inputWidth} onChange={handleChangeWidth} />
        </label>
        <label className="Height">
          <div>Height: </div>
          <input type="number" value={inputHeight} onChange={handleChangeHeight} />
        </label>
        <label className="Height">
          <div>Add Text: </div>
          <input type="text" value={addText} onChange={handleChangeText} />
        </label>
        <input className="Apply" type="submit" value="Submit" />
      </form>
      <div className="Draw">
        <canvas id='canvas' ref={canvasRef} width={window.innerWidth - 200} height={window.innerHeight}></canvas>
        <div className="wrapImage">
          <img id="helloImage" width="200" height="200" src={helloImg} alt="Hello There" />
        </div>
      </div>
    </div>
  )
}

export default App;

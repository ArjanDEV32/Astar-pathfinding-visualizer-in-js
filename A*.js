const box = document.getElementById('box')
const CV = document.getElementById('cv')
const CVBG = document.getElementById('cv-bg')
const CVFG = document.getElementById('cv-fg')
const CTX = CV.getContext("2d", { willReadFrequently: true })
const CTXBG = CVBG.getContext("2d")
const CTXFG = CVFG.getContext("2d")
const Start = document.getElementById('start')
const draw = document.getElementById('draw')
const Goal = document.getElementById('goal')
const Run = document.getElementById('run')
const Reset = document.getElementById('reset')
const MazeGen = document.getElementById('maze-gen')
const pixelSizeBtn = document.getElementById('pixel-size')
const pixelSizeCont = document.getElementById('pixel-size-cont')
const pixelSizeRange = document.getElementById('pixel-size-range')
const Dimensions = [1110, 510]


CV.width = Dimensions[0]
CV.height = Dimensions[1]
CVBG.width = Dimensions[0]
CVBG.height = Dimensions[1]
CVFG.width = Dimensions[0]
CVFG.height = Dimensions[1]

CV.style.width = Dimensions[0]
CV.style.height = Dimensions[1]
CVBG.style.width = Dimensions[0]
CVBG.style.height = Dimensions[1]
CVFG.style.width = Dimensions[0]
CVFG.style.height = Dimensions[1]


const Flags={
  run: false,
  toggle: false,
  canPlaceStartNode: false,
  reset: false,
  canPlaceGoalNode: false,
  GoalBtn: false,
  StartBtn: false,
  RunBtn: false,
  MazeGenBtn: false,
  MapBtn: false,
  GoalReached: false,
  startNodePlaced: false,
  goalNodePlaced: false,
  GoalCantBeReached: false,
  pixelSizeBtnPressed: false,
}

let pixelSize = 10
let validPixelSizeRange = []
for(let i=1, f = 0; i<=100;i++){ 
  if(Dimensions[0]/i == Math.floor(Dimensions[0]/i) && Dimensions[1]/i == Math.floor(Dimensions[1]/i)){
    f+=1
    validPixelSizeRange.push(i)
    let pixels  = document.createElement("label")
    let inp  = document.createElement("input")
    inp.setAttribute("type","radio")
    inp.setAttribute("id",`${i}`)
    inp.setAttribute("name",`size`)
    pixels.setAttribute("for",`${i}`)
    if((Dimensions[0]/i*10)==Dimensions[0]) inp.checked = true
    pixels.classList.add("pixelSizeButtons")
    pixels.innerHTML = `<p style="margin:5px;">${Dimensions[0]/i*10}x${Dimensions[1]/i*10}</p>`
    pixels.addEventListener("click",()=>{
      pixelSize =  i
      row = Math.floor(Dimensions[0] / pixelSize)
      col = Math.floor(Dimensions[1] / pixelSize)
      end()
    })
    pixelSizeCont.appendChild(inp)
    pixelSizeCont.appendChild(pixels)
  } 
}


let row = Math.floor(Dimensions[0]/pixelSize)
let col = Math.floor(Dimensions[1]/pixelSize)
let sx, gx
let sy, gy
let sxi, syi
let gxi, gyi
let rn = 0
let toBeEvaluatedSet = []
let evaluatedSet = {}
let displayNodes = {}
let Path = []
let visited = {}
let current = {}
let Int
let gradient = 0
const wallLength = 3
const wallRand = 3

CTXBG.strokeStyle = "#eeeded"
CTXBG.lineWidth = 0.7

for (let i = 0; i < col; i++) { 
  for (let j = 0; j < row; j++) {
    if(pixelSize>2){ 
    CTXBG.beginPath()
    CTXBG.moveTo(0, i * pixelSize)
    CTXBG.lineTo(Dimensions[0], i * pixelSize)
    CTXBG.stroke()

    CTXBG.beginPath()
    CTXBG.moveTo(j * pixelSize, 0)
    CTXBG.lineTo(j * pixelSize, Dimensions[1])
    CTXBG.stroke()
    }
  }
}

const spacePixel=(n)=>{n/=pixelSize, n>>=0, n*=pixelSize; return n}

document.addEventListener('mouseup',()=>{Flags.toggle = false})

CVFG.addEventListener("mousedown", (e) => {
  let color = CTX.getImageData(spacePixel(e.offsetX),spacePixel(e.offsetY),1,1).data
  if (Flags.canPlaceStartNode == false && Flags.canPlaceGoalNode == false && Flags.RunBtn == false) {
    if (spacePixel(e.offsetX) != sx && spacePixel(e.offsetY) != sy && spacePixel(e.offsetX) != gx && spacePixel(e.offsetY) != gy) {
      Flags.toggle = true
      CTX.fillStyle = "#70686e"
      CTX.fillRect(spacePixel(e.offsetX), spacePixel(e.offsetY), pixelSize, pixelSize)
    }
  }

  if(Flags.canPlaceStartNode == true && Flags.RunBtn == false) {
    if(color[3]==0 || color[0]==255 && color[1]==255 && color[2]==255){ 
      Flags.canPlaceStartNode = false
      Flags.startNodePlaced = true
      CTXFG.strokeStyle = "#eb4034"
      CTXFG.strokeRect(spacePixel(e.offsetX), spacePixel(e.offsetY), pixelSize, pixelSize)
      sxi = spacePixel(e.offsetX)/pixelSize
      syi = spacePixel(e.offsetY)/pixelSize
      sx = spacePixel(e.offsetX)
      sy = spacePixel(e.offsetY)
    }
  }

  if (Flags.canPlaceGoalNode == true && Flags.RunBtn == false) {
    if (spacePixel(e.offsetX) != sx || spacePixel(e.offsetY) != sy) {
      if(color[3]==0 || color[0]==255 && color[1]==255 && color[2]==255){ 
        Flags.canPlaceGoalNode = false
        Flags.goalNodePlaced = true
        CTXFG.strokeStyle = "#34eb5b"
        CTXFG.strokeRect(spacePixel(e.offsetX), spacePixel(e.offsetY), pixelSize, pixelSize)
        gxi = spacePixel(e.offsetX)/pixelSize
        gyi = spacePixel(e.offsetY)/pixelSize
        gx = spacePixel(e.offsetX)
        gy = spacePixel(e.offsetY)
      }
    }
  }
})


CVFG.addEventListener("mousemove", (e) => {
  if (Flags.toggle == true) {
    if(spacePixel(e.offsetX) != sx || spacePixel(e.offsetY) != sy) {
      if(spacePixel(e.offsetX) != gx || spacePixel(e.offsetY) != gy) {
        CTX.fillStyle = "#70686e"
        CTX.fillRect(spacePixel(e.offsetX), spacePixel(e.offsetY), pixelSize, pixelSize)
      }
    }
  }
})


Start.addEventListener("click", () => {
  if(Flags.StartBtn == false && Flags.goalNodePlaced == false) {
    Flags.StartBtn = true
    Flags.canPlaceStartNode = true
    Flags.reset = true
    Start.style.backgroundColor = "rgb(251, 251, 251)"
    Start.style.border = "1px solid #eeeded"
    Start.style.color = "rgb(255, 0, 0)"
  }
})

Start.addEventListener("mouseover", () => {
  if (Flags.StartBtn == false && Flags.goalNodePlaced == false) {
    Start.style.color = "rgb(255, 0, 0)"
    Start.style.border = "1px solid #eeeded"
  }
})

Start.addEventListener("mouseout", () => {
  if (Flags.StartBtn == false && Flags.goalNodePlaced == false) {
    Start.style.color = "black"
    Start.style.border = "none"
  }
})





Goal.addEventListener("click", () => {
  if (Flags.GoalBtn == false && Flags.startNodePlaced == true) {
    Flags.GoalBtn = true
    Flags.canPlaceGoalNode = true
    Flags.reset = true
    Goal.style.backgroundColor = "rgb(251, 251, 251)"
    Goal.style.border = "1px solid #eeeded"
    Goal.style.color = "rgb(15, 212, 15)"
  }
  if (Flags.startNodePlaced == false) alert("start node must be placed")
})



Goal.addEventListener("mouseover", () => {
  if (Flags.GoalBtn == false) {
    Goal.style.color = "rgb(15, 212, 15)"
    Goal.style.border = "1px solid #eeeded"
  }
})



Goal.addEventListener("mouseout", () => {
  if (Flags.GoalBtn == false) {
    Goal.style.color = "black"
    Goal.style.border = "none"
  }
})





Run.addEventListener("click", () => {
  if (Flags.RunBtn == false && Flags.startNodePlaced == true && Flags.goalNodePlaced == true) {
    Flags.RunBtn = true
    Run.style.backgroundColor = "rgb(251, 251, 251)"
    Run.style.border = "1px solid #eeeded"
    Run.style.color = "yellow"
  }
})



Run.addEventListener("mouseover", () => {
  if (Flags.RunBtn == false) {
    Run.style.color = "yellow"
    Run.style.border = "1px solid #eeeded"
  }
})



Run.addEventListener("mouseout", () => {
  if (Flags.RunBtn == false) {
    Run.style.color = "black"
    Run.style.border = "none"
  }
})


const drawWall=(x,y)=>{ 
  rn = Math.floor(Math.random()*wallRand)
  CTX.fillStyle = "#70686e"
  for(let i = 0; i<wallLength*pixelSize; i+=pixelSize){
    for(let j = 0; j<wallLength*pixelSize; j+=pixelSize){
      if(rn == 1) CTX.fillRect(spacePixel(j+x), spacePixel(y), pixelSize, pixelSize)
      if(rn == 2) CTX.fillRect(spacePixel(x), spacePixel(i+y), pixelSize, pixelSize)
    }
  }
}


MazeGen.addEventListener("click", () => {
  if (Flags.MazeGenBtn == false && Flags.startNodePlaced == false && Flags.goalNodePlaced == false) {

    Flags.MazeGenBtn = true
    MazeGen.style.backgroundColor = "rgb(251, 251, 251)"
    MazeGen.style.border = "1px solid #eeeded"
    MazeGen.style.color = "rgb(211, 57, 134)"
    CTX.fillStyle = "#70686e"

  for (let i = 0; i <col; i++) {
      for (let j = 0; j <row; j++) {
        if(i == 0 || i == col-1 || j == 0 || j == row-1 ){ 
          CTX.fillRect(spacePixel(j*pixelSize), spacePixel(i*pixelSize), pixelSize, pixelSize)
        } 
        if(i%(wallLength-1)==0 && j%(wallLength-1)==0 && j<row-(wallLength-1) && j>=0 && i<col-(wallLength-1) && i>=0) drawWall(j*pixelSize, i*pixelSize)
      }
    }
  }
  if (Flags.startNodePlaced == true || Flags.goalNodePlaced == true) alert("maze must be generated first")
})


MazeGen.addEventListener("mouseover", () => {
  if (Flags.MazeGenBtn == false) {
    MazeGen.style.color = "rgb(211, 57, 134)"
    MazeGen.style.border = "1px solid #eeeded"
  }
})

MazeGen.addEventListener("mouseout", () => {
  if (Flags.MazeGenBtn == false) {
    MazeGen.style.color = "black"
    MazeGen.style.border = "none"
  }
})                                  
 

const SetAsMarked = (Node) => {
  let x = Node[0]
  let y = Node[1]

  if (sx < gx) gradient = Math.min((((Math.abs(x - sx) / Math.abs(gx - sx) + Math.min(y / gy, 0.3)) / 2) * 150),150)
  if (sx > gx) gradient = Math.min((((Math.abs(sx - x) / Math.abs(sx - gx) + Math.min(y / gy, 0.3)) / 2) * 150),150)
  if (sx == gx && sy > gy) gradient =  Math.min((((Math.abs(y - sy) / Math.abs(gy - sy) + Math.min(x / gx, 0.1)) / 2) * 150),150)
  if (sx == gx && sy < gy) gradient =  Math.min((((Math.abs(sy - y) / Math.abs(sy - gy) + Math.min(x / gx, 0.1)) / 2) * 150),150)

  CTX.fillStyle = `hsl(${gradient}deg 50% 78%)`
  CTX.fillRect(spacePixel(x), spacePixel(y), pixelSize, pixelSize)
}

const Add2MinHeap = (val, minheap) => {
  minheap.push(val)
  let r = minheap.length - 1
  let l = Math.floor((r - 1) / 2)
  let temp
  while (r > 0 && minheap[r].H <= minheap[l].H) {
    temp = minheap[l]
    minheap[l] = minheap[r]
    minheap[r] = temp
    r = l
    l = Math.floor((r - 1) / 2)
  }
}

const RemoveFromMinHeap = (val, minheap) => {
  let target = -1
  for (let i = 0; i < minheap.length; i++) {
    if (val.co[0] == minheap[i].co[0] && val.co[1] == minheap[i].co[1]) {
      target = i
      break
    }
  }
  if (target == -1) return
  minheap[target] = minheap[minheap.length - 1]
  minheap.pop()
  let l, r, temp, s
  while (1) {
    l = 2 * target + 1
    r = 2 * target + 2
    s = target
    if (l < minheap.length && minheap[l].F <= minheap[s].F) s = l
    if (r < minheap.length && minheap[r].F <= minheap[s].F) s = r
    if (s != target) {
      temp = minheap[target]
      minheap[target] = minheap[s]
      minheap[s] = temp

      target = s
    } else break
  }
}

const CalcCost = (coordinates, type) => {
  let x = coordinates[0]
  let y = coordinates[1]
  let g =  /*Math.abs(x-sx)+Math.abs(y-sy)*/  Math.floor(Math.sqrt(Math.pow(x-sx,2) + Math.pow(y-sy,2)))
  let h =  /*Math.abs(x-gx)+Math.abs(y-gy)*/  Math.floor(Math.sqrt(Math.pow(x-gx,2) + Math.pow(y-gy,2)))
  let f = g + h
  if (type === "G") return g
  if (type === "H") return h
  if (type === "F") return f
}

const GetNeighbors = (NodeCoordinates) => {
  let x = NodeCoordinates[0]
  let y = NodeCoordinates[1]
  let color = [0, 0, 0]

  let Neighbors = [
    [x + pixelSize, y], //right Neighbor
    [x - pixelSize, y], //left Neighbor
    [x, y + pixelSize], //up Neighbor
    [x, y - pixelSize], //down Neighbor
    //[x + pixelSize, y + pixelSize], // diagonal right up Neighbor
    //[x - pixelSize, y + pixelSize], // diagonal left up Neighbor
    //[x + pixelSize, y - pixelSize], // diagonal right down Neighbor
    //[x - pixelSize, y - pixelSize], // diagonal left down Neighbor 
  ]

  let ValidNeighbors = []

  for (const N of Neighbors) {
    color = CTX.getImageData(N[0], N[1], pixelSize, pixelSize).data
    if (N[0] < CV.width && N[1] < CV.height && N[0] >= 0 && N[1] >= 0) {
      if (color[3] == 0) {

        ValidNeighbors.push({ co: N, ic: [N[0] / pixelSize, N[1] / pixelSize]})
        
        displayNodes[JSON.stringify(N)] = {
          co: [N[0], N[1]],
          G: 0,
          H: 0,
          F: 0,
          ic: [N[0] / pixelSize, N[1] / pixelSize],
          parent:undefined
        
        }
      }
    }
  }

  return ValidNeighbors
}


Run.addEventListener("click", () => {

  if (Flags.goalNodePlaced == true && Flags.startNodePlaced == true) {
    if (Flags.run == false) {

      Flags.run = true

      displayNodes[JSON.stringify([sx, sy])] = {
        co: [sx, sy],
        G: CalcCost([sx, sy], "G"),
        H: CalcCost([sx, sy], "H"),
        F: CalcCost([sx, sy], "F"),
        ic: [sxi, syi],
        parent: undefined,
      }

      displayNodes[JSON.stringify([gx, gy])] = {
        co: [gx, gy],
        G: CalcCost([gx, gy], "G"),
        H: CalcCost([gx, gy], "H"),
        F: CalcCost([gx, gy], "F"),
        ic: [gxi, gyi],
        parent: undefined,
      }

      Add2MinHeap(displayNodes[JSON.stringify([sx, sy])], toBeEvaluatedSet)

      Int = setInterval(() => {

        if (toBeEvaluatedSet.length == 0) clearInterval(Int), alert("Goal can't be reached :(");
        
        current = toBeEvaluatedSet[0]

        if (current.ic[0] == gxi && current.ic[1] == gyi) Flags.GoalReached = true;

        RemoveFromMinHeap(current, toBeEvaluatedSet)
        evaluatedSet[JSON.stringify(current.co)] = 1

        for (const node of GetNeighbors(current.co)) {

          SetAsMarked(node.co)
          if (pixelSize > 10) {

            CTXFG.font = `${Math.floor(pixelSize / 4)}px Arial`
            CTXFG.fillStyle = "white"
            CTXFG.fillText(`h:${CalcCost(node.co, "H")}`, node.co[0] + Math.floor(pixelSize / 3) - 4, node.co[1] + Math.floor(pixelSize / 2))
            CTXFG.fillText(`g:${CalcCost(node.co, "G")}`, node.co[0] + Math.floor(pixelSize / 3) - 4, node.co[1] + Math.floor(pixelSize / 2) + Math.floor(pixelSize / 4))
          }

          if (visited[JSON.stringify(node.co)] != node.ic) {
            if (evaluatedSet[JSON.stringify(node.co)] == undefined) {
              displayNodes[JSON.stringify(node.co)].parent = current
              displayNodes[JSON.stringify(node.co)].G = CalcCost(node.co, "G")
              displayNodes[JSON.stringify(node.co)].H = CalcCost(node.co, "H")
              displayNodes[JSON.stringify(node.co)].F = displayNodes[JSON.stringify(node.co)].G + displayNodes[JSON.stringify(node.co)].H
              Add2MinHeap(displayNodes[JSON.stringify(node.co)], toBeEvaluatedSet)
              
            }
          }

          visited[JSON.stringify(node.co)] = node.ic
         
        }

        if (Flags.GoalReached == true) {
          clearInterval(Int)

          CTX.fillStyle = `hsl(${160}deg 40% 40%)`
          CTX.fillRect(gx, gy, pixelSize, pixelSize)

          CTX.fillStyle = `hsl(${0}deg 40% 40%)`
          CTX.fillRect(sx, sy, pixelSize, pixelSize)

          setTimeout(() => {
            alert("Goal Reached!")
          }, 200)

          let tempnode = current
          while (tempnode != undefined) {
            Path.push(tempnode.parent)
            tempnode = tempnode.parent
          }

          for (let i = 0; i < Path.length-1; i++) {
            CTX.shadowBlur = 30
            CTX.shadowColor = `hsl(${160 - (i / Path.length) * 160}deg 100% 20%)`
            CTX.fillStyle = `hsl(${160 - (i / Path.length) * 160}deg 30% 40%)`
            CTX.fillRect(Path[i].co[0], Path[i].co[1], pixelSize, pixelSize)
          }
        }
      }, 10)
    }
  } else alert("startnode and endnode must be placed first")
})

function end(){

  CTX.clearRect(0, 0, Dimensions[0], Dimensions[1])
  CTXBG.clearRect(0, 0, Dimensions[0], Dimensions[1])
  CTXFG.clearRect(0, 0, Dimensions[0], Dimensions[1])

 
  for (let i = 0; i < col; i++) {
    for (let j = 0; j < row; j++) {
      CTXBG.beginPath()
      CTXBG.strokeStyle = "#eeeded"
      CTXBG.lineWidth = 0.7
      CTXBG.moveTo(0, i * pixelSize)
      CTXBG.lineTo(Dimensions[0], i * pixelSize)
      CTXBG.stroke()
  
      CTXBG.beginPath()
      CTXBG.strokeStyle = "#eeeded"
      CTXBG.lineWidth = 0.7
      CTXBG.moveTo(j * pixelSize, 0)
      CTXBG.lineTo(j * pixelSize, Dimensions[1])
      CTXBG.stroke()
    }
  }
  clearInterval(Int)

  Flags.StartBtn = false
  Flags.GoalBtn = false
  Flags.RunBtn = false
  Flags.MazeGenBtn = false
  Flags.GoalReached = false
  Flags.startNodePlaced = false
  Flags.goalNodePlaced = false
  Flags.canPlaceGoalNode = false
  Flags.canPlaceStartNode = false
  Flags.run = false
  current = 0
  gradient = 0
  toBeEvaluatedSet = []
  evaluatedSet = {}
  displayNodes = {}
  Path = []
  Start.style.backgroundColor = "white"
  Start.style.border = "none"
  Start.style.color = "black"
  Goal.style.backgroundColor = "white"
  Goal.style.border = "none"
  Goal.style.color = "black"
  Run.style.backgroundColor = "white"
  Run.style.border = "none"
  Run.style.color = "black"
  MazeGen.style.backgroundColor = "white"
  MazeGen.style.border = "none"
  MazeGen.style.color = "black"
  CTX.shadowBlur = 0
}
    


Reset.addEventListener("mousedown",end)



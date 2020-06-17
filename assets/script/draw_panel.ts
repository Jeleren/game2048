
const {ccclass, property} = cc._decorator;

import Block from './Block'

@ccclass
export default class DrawPanel extends cc.Component {

    private colNum: number = 4
    private rowNum: number = 4
    @property(cc.Graphics) panel: cc.Graphics = null
    @property(cc.Prefab) block: cc.Prefab = null

    private startX: number = 0
    private startY: number = 0
    private board_h: number = 0
    private board_w: number = 0
    private node_pool: cc.NodePool
    private node_list = [[]]
    public len: number
    private start_point: cc.Vec2 = null
    private end_point: cc.Vec2 = null
    private move_direction: number // 1 up 2 down 3 left 4 right
    private offset_x: number  // 内容与边界的偏置值 保持内容在中央
    private offset_y: number
    private temp: cc.Node

    onLoad () {
        // 初始化并且绘制棋盘
        // 棋盘 = 一定数量的行和列
        // 先确定每个块的大小
        this.len = this.node.width / this.colNum
        this.board_h = this.len * this.rowNum
        this.board_w = this.len * this.colNum
        // 确保棋盘位于中央 坐标设置从中心点往外扩展
        this.startX = this.node.width / 2 - this.len * this.colNum / 2
        this.startY = this.node.height / 2 - this.len * this.rowNum / 2
        this.panel.clear()
        // 开始从起点画线 横竖分开画
        this.drawLine()
        // 画完棋盘 开始初始化 数字模块 
        
        for(let i = 0; i < this.rowNum; i++) 
            this.node_list[i] = []
        this.node_pool = new cc.NodePool('Block')
        for(let i = 0; i < this.rowNum * this.colNum; i++) {
            let b = cc.instantiate(this.block)
            let c = b.getComponent(cc.Label)
            c.fontSize = this.len / 2
            c.lineHeight = this.len / 2
            c.string = '2'
            this.node_pool.put(b)
        }
        for(let i = 0; i < 2; i++){
            let b = this.node_pool.get()
            // let c = b.getComponent(cc.Label)
            // c.fontSize = this.len / 2
            // c.lineHeight = this.len / 2
            // c.string = '2'
            b.parent = this.node
            let p = this.newIndex()
            this.newPosition(b, p)
            this.node_list[p[0]][p[1]] = b  // x 为列
            this.offset_x = (this.len - b.width) / 2
            this.offset_y = (this.len - b.height) / 2
        }
        console.log(this.node_list)
        // 基本的初始化完成后  需要对界面进行操作的监听 根据touch事件来
        this.node.on('touchstart', this.touchStart, this)
        this.node.on('touchend', this.touchEnd, this)
    }

    // 生成节点坐标的索引
    newIndex() {
        // let index = [Math.floor(Math.random() * this.colNum), Math.floor(Math.random() * this.rowNum)]
        let index = [1, Math.floor(Math.random() * this.rowNum)]
        while(this.node_list[index[0]][index[1]]) {
            index = [Math.floor(Math.random() * this.colNum), Math.floor(Math.random() * this.rowNum)]
            console.log('节点重复 新节点位置为', index)
        }
        return index
    }
    newPosition(node: cc.Node, point: number[]) {
        console.log(point)
        node.setPosition(this.startX + point[0] * this.len + (this.len - node.width) / 2, this.startY + point[1] * this.len + (this.len - node.height) / 2)
    }

    indexToPoint(index: number[]): cc.Vec2 {
        // console.log(index)
        let p = new cc.Vec2()
        p.x = this.startX + index[0] * this.len + this.offset_x
        p.y = this.startY + index[1] * this.len + this.offset_y
        // console.log('vec', p)
        return p
    }

    drawLine() {
        for(let i = 0; i <= this.colNum; i++){
            let x = this.startX + i * this.len
            // 移动起点到某个坐标 使用moveTo
            this.panel.moveTo(x, this.startY)
            // 创建线条 使用lineTo
            this.panel.lineTo(x, this.startY + this.board_h)
            // 画出线条
            this.panel.stroke()
        }
        for(let i = 0; i <= this.rowNum; i++){
            const y = this.startY + i * this.len
            this.panel.moveTo(this.startX, y)
            this.panel.lineTo(this.startX + this.board_w, y)
            this.panel.stroke()
        }
    }

    touchStart(event: cc.Event.EventTouch) {
        this.start_point = event.getLocation()
    }
    touchEnd(event: cc.Event.EventTouch) {
        if(!this.start_point) throw new Error('程序出错 无法移动')
        this.end_point = event.getLocation()
        // 在获取到相关坐标之后 需要进行方向的判断 这里存在四种方向 进行x 和 y 方向偏移量的比较就可以得出移动方向
        const offset_x = this.end_point.x - this.start_point.x
        const offset_y = this.end_point.y - this.start_point.y
        if(offset_x < 0 && Math.abs(offset_x) > Math.abs(offset_y))
            this.move_direction = 3
        else if(offset_x > 0 && Math.abs(offset_x) > Math.abs(offset_y))
            this.move_direction = 4
        else if(offset_y < 0 && Math.abs(offset_y) > Math.abs(offset_x))
            this.move_direction = 2
        else if(offset_y > 0 && Math.abs(offset_y) > Math.abs(offset_x))
            this.move_direction = 1
        this.start_point = null
        this.end_point = null
        // console.log(this.move_direction)
        // 开始移动棋盘中的所有元素
        this.moveAllNode()
        this.move_direction = null
    }

    newNode(){
        console.log('nd')
        let x = Math.floor(Math.random() * (this.colNum - 1)),
        x_copy = x
        // console.log(`${x}:`,this.node_list[x].length, this.node_list)
        let y = Math.floor(Math.random() * (this.rowNum - 1))
        while(this.node_list[x] && this.node_list[x][y]){
            y++
            if(y >= this.rowNum){
                x++
                y = 0
            }
            if(x == x_copy)
                return null
        }
        console.log('new node at', x, y)
        if(this.node_pool.size() <= 0)
            this.node_pool.put(cc.instantiate(this.block))
        let p = this.node_pool.get()
        // p.stopAllActions()
        // let p = cc.instantiate(this.block)
        this.node_list[x][y] = p
        p.setPosition(this.indexToPoint([x, y]))
        p.parent = this.node
    }

    async moveAllNode() {
        if(!this.move_direction) throw new Error('程序出错 没有移动方向')
        // 这里需要确定移动的次序 在最外面的最先移动 需要每行每列的节点数量 那就将node_list 改成二维数组
        // 根据方向的不同 遍历的方法与不同
        // console.log(this.node_list)
        if(this.move_direction == 1) { // 向上移动
            for(let i = this.rowNum - 2; i >= 0; i--) {
                for(let j = 0; j < this.colNum; j++) {
                    if(this.node_list[j][i]){  // 遍历到每个节点时 要进行判断 其前面是否有空间可以移动 如果有就继续前移
                        let index = i
                        while(this.node_list[j].length && !this.node_list[j][index + 1]) {
                            if(index >= this.rowNum - 1) break
                            index++
                        }
                        let block = this.node_list[j][index + 1]
                        if(block) {
                            let str = block.getComponent(cc.Label).string
                            if(this.node_list[j][i].getComponent(cc.Label).string == str) {
                                let move = cc.moveTo(0.2, this.indexToPoint([j, index + 1]))
                                await new Promise((resolve) => {
                                    let cb = cc.callFunc(function(){
                                        this.node_list[j][index + 1].getComponent(cc.Label).string = (Number(str) * 2).toString()
                                        this.node_pool.put(this.node_list[j][i])
                                        this.node_list[j][i] = null
                                        resolve('done')
                                    }, this)
                                    this.node_list[j][i].runAction(cc.sequence(move, cb))
                                })
                            } else {
                                this.commenMove(i, j, index, 1)
                            }
                        } else {
                            this.commenMove(i, j, index, 1)
                        }
                    }
                }
            }
        }
        else if(this.move_direction == 2) { // down
            for(let i = 1; i < this.rowNum; i++) {
                for(let j = 0; j < this.colNum; j++) {
                    if(this.node_list[j][i]){  // 遍历到每个节点时 要进行判断 其前面是否有空间可以移动 如果有就继续前移
                        let index = i
                        while(this.node_list[j].length && !this.node_list[j][index - 1]) {
                            if(index == 0) break
                            index--
                        }
                        let block = this.node_list[j][index - 1]
                        if(block) {
                            let str = block.getComponent(cc.Label).string
                            if(this.node_list[j][i].getComponent(cc.Label).string == str) {
                                let move = cc.moveTo(0.2, this.indexToPoint([j, index - 1]))
                                await new Promise((resolve) => {
                                    let cb = cc.callFunc(function(){
                                        this.node_list[j][index - 1].getComponent(cc.Label).string = (Number(str) * 2).toString()
                                        this.node_pool.put(this.node_list[j][i])
                                        this.node_list[j][i] = null
                                        resolve('done')
                                    }, this)
                                    this.node_list[j][i].runAction(cc.sequence(move, cb))
                                })
                            } else {
                                this.commenMove(i, j, index, 1)
                            }
                        } else {
                            this.commenMove(i, j, index, 1)
                        }
                    }
                }
            }
        }
        else if(this.move_direction == 3) { // left
            for(let i = 1; i < this.colNum; i++) {
                for(let j = 0; j < this.rowNum; j++) {
                    if(this.node_list[i][j]){  // 遍历到每个节点时 要进行判断 其前面是否有空间可以移动 如果有就继续前移
                        let index = i
                        while(!this.node_list[index - 1] || !this.node_list[index - 1][j]) {
                            if(index == 0) break
                            index--
                        }
                        let block = null
                        if(this.node_list[index - 1] && this.node_list[index - 1][j])
                            block = this.node_list[index - 1][j]
                        if(block) {
                            let str = block.getComponent(cc.Label).string
                            if(this.node_list[i][j].getComponent(cc.Label).string == str) {
                                let move = cc.moveTo(0.2, this.indexToPoint([index - 1, j]))
                                await new Promise((resolve) => {
                                    let cb = cc.callFunc(function(){
                                        this.node_list[index - 1][j].getComponent(cc.Label).string = (Number(str) * 2).toString()
                                        this.node_pool.put(this.node_list[i][j])
                                        this.node_list[i][j] = null
                                        resolve('done')
                                    }, this)
                                    this.node_list[i][j].runAction(cc.sequence(move, cb))
                                })
                            } else {
                                this.commenMove(j, i, index, 2)
                            }
                        } else {
                            this.commenMove(j, i, index, 2)
                        }
                    }
                }
            } 
        }
        else if(this.move_direction == 4) { // right
            for(let i = this.colNum - 1; i >= 0; i--) {
                for(let j = 0; j < this.rowNum; j++) {
                    if(this.node_list[i][j]){  // 遍历到每个节点时 要进行判断 其前面是否有空间可以移动 如果有就继续前移
                        let index = i
                        while(!this.node_list[index + 1] || !this.node_list[index + 1][j]) {
                            if(index == this.colNum - 1) break
                            index++
                        }
                        let block = null
                        if(this.node_list[index + 1] && this.node_list[index + 1][j])
                            block = this.node_list[index + 1][j]
                        if(block) {
                            let str = block.getComponent(cc.Label).string
                            if(this.node_list[i][j].getComponent(cc.Label).string == str) {
                                let move = cc.moveTo(0.2, this.indexToPoint([index + 1, j]))
                                await new Promise((resolve) => {
                                    let cb = cc.callFunc(function(){
                                        this.node_list[index + 1][j].getComponent(cc.Label).string = (Number(str) * 2).toString()
                                        this.node_pool.put(this.node_list[i][j])
                                        this.node_list[i][j] = null
                                        resolve('done')
                                    }, this)
                                    this.node_list[i][j].runAction(cc.sequence(move, cb))
                                })
                            } else {
                                this.commenMove(j, i, index, 2)
                            }
                        } else {
                            this.commenMove(j, i, index, 2)
                        }
                    }
                }
            }
        }
        console.log(this.node_list)

        this.newNode()
    }

    commenMove(i: number, j: number, index: number, type: number) {
        if(type == 1) {
            if(i == index) return
            this.node_list[j][i].runAction(cc.moveTo(0.2, this.indexToPoint([j, index])))
            this.node_list[j][index] = this.node_list[j][i]
            this.node_list[j][i] = null
        }
        else {
            if(j == index) return
            this.node_list[j][i].runAction(cc.moveTo(0.2, this.indexToPoint([index, i])))
            this.node_list[index][i] = this.node_list[j][i]
            this.node_list[j][i] = null
        }
        
    }
}
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
import DrawPanel from './draw_panel'

@ccclass
export default class Block extends cc.Component {

    reuse() {
        // let c = this.node.getComponent(cc.Label)
        // c.string = '2'
        // c.fontSize = DrawPanel.prototype.len / 2
    }
    unuse() {
        this.node.getComponent(cc.Label).string = '2'
    }
}


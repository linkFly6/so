# 从angularJS看前端MVVM

<div class="l-index">
我工作的业务也不会涉及到angularJS这么重量级的东西，只有自己闲暇之余做的项目才能一尝angularJS。我才疏学浅，而这个话题又很大。javascript厚积薄发走势异常迅猛，导致现在各种MV*框架百家争雄，MVVM从MVC演变而来，为javascript注入了全新的活力。我也不能保证我所说的一定都是对的，但凡有讨论这些比较抽象性的东西，必然有争论。这一切都是探索过去未知的领域，无论谁对谁错，任何的探索都是值得的。
</div>
> 本文内容如下：  
>  
> - MVC和MVVM
> - 数据双向绑定
> - AngularJS带来的活力
> - 前端导向

## MVC和MVVM
初次接触MVC是ASP.NET MVC，早前一直编写aspx的我接触到MVC之后爱的死去活来，深深的被它灵动简洁的思想所震撼，而当初的我js写的实在是渣，连jquery都用不好。也从未想到前端竟然也能够导入MVC这么抽象性的东西。
近年，前端的需求也越来越重，过去后端的处理大多数都转移到了前端，而javascript又十分争气，一雪过去被鄙夷的耻辱。过去的javascript只是辅助页面的展现搞一些炫丽的特效，而现在已经演变的成为数据展现、加工的主力——随着前端任务繁重——前端MVC乘势而起。
MV*的思想中心很一致：UI和逻辑分离，提取数据模型。

**Model View Controller - MVC**
MVC核心：Model(模型)，View(UI)，Controller(控制器)
- Model：数据展现的对象模型，例如一个列表页HTML对象的模型
- View：UI，页面中就是HTML
- Controller：处理/加工Model
他们的执行顺序应该是这样：
Controller=>Model=>View
如下图：



**Model View ViewModel - MVVM**
MVVM核心：Model(模型)，View(UI)，ViewModel(视图模型)
- Model：数据展现的对象模型，例如一个列表页HTML对象的模型
- View：UI，页面中就是HTML
- ViewModel：处理/加工Model，和MVC不同的Model呈现到View由框架维护
他们的执行顺序应该是这样：
ViewModel=>Model=>View

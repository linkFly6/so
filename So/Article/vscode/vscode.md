#visual studio code一些使用问题

##vscode设为默认打开方式，更新后失效
> windows系统下，把vscode设置为默认打开方式，更新后在右键"打开方式"程序列表里丢失。

原因是因为vscode的启动方式非常奇葩，安装完vscode目录结构是这样的：

> 
	├── app-0.5.0
	│	├── locales    
	│	├── resources  
	│	└── Code.exe      
	├── bin  
	├── packages  
	├── .dead   
	├── app.ico
	├── SquirrelSetup.log
	├── Update.exe
  
其中`app-x.x.x`文件是一直更新的，例如当前版本是0.3.0，则名称为`app-0.3.0`，也就是说，vscode每更新一次版本都会生成对应的文件夹。
  
VS注册的启动方式是`Update.exe`程序，是这样的：
```
	C:\Users\用户名\AppData\Local\Code\Update.exe --processStart Code.exe
```

但是真正启动是`app-x.x.x/Code.exe`。  
默认启动`Update.exe`是传递参数的，猜测应该是启动的时候通过`Update.exe`先检测更新，没有检测到再去最新版本的文件夹里启动。  
这个自动更新和目录映射的机制做的真心狗血，因为如果你在某些地方使用了直接指向vscode启动文件静态路径，例如：

```
	C:\Users\用户名\AppData\Local\Code\app-0.5.0\Code.exe
```

就表示直接启动vscode 0.5.0下面的真正启动程序，但是一旦发生更新，例如vscode更新到了0.6.0，那么指向的路径应该是这样：

```
	C:\Users\用户名\AppData\Local\Code\app-0.6.0\Code.exe
```

所以你的静态路径指向就失效了，尤其是针对`Code.exe`创建的快捷方式，升级后直接无效。

回到最初的问题：**vscode更新后，在右键打开方式列表里失效**，就是因为这个问题。

解决方式很简单：
- 打开注册表 - WIN+R，输入`regedit`，点击`确定`
- 找到注册表程序列表项："HKEV-CLASSES-ROOT\\APPlications\\Code.exe\\shell\\open\\command"：  
├── HKEV-CLASSES-ROOT  
│	├── APPlications  
│	│	├── Code.exe  
│	│	│	├── shell  
│	│	│	│	├── open  
│	│	│	│	│	├── command  

- 修改`command`项的值，修正它为正确的路径（更新后的路径），例如原来是值是下面这样的：
```
	"C:\Users\用户名\AppData\Local\Code\app-0.3.0\Code.exe" "%1"
```
则修改为最新版（例如是0.5.0）
```
	"C:\Users\用户名\AppData\Local\Code\app-0.5.0\Code.exe" "%1"
```

之后再找一个文件右键点击"打开方式"，是不是又发现vscode了？

原理大家懂的，因为vscode奇葩的更新方式，导致注册表没有指向正确的更新后的文件夹。  
这里就是手动更新一下右键菜单"打开方式"程序列表的注册表。

PS.右键"打开方式"里面一些失效的、丢失的、看着心烦的程序项，都可以在注册表：HKEV-CLASSES-ROOT\\APPlications\\里删除。
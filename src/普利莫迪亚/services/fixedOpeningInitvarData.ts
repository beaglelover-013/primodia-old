import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

export type FixedOpeningInitvarKind = 'fox' | 'sheep' | 'deer' | 'twins';

const FIXED_OPENING_INITVAR_SOURCE = "版本一：橘柒（狐族求职者）\r\n\r\n世界:\r\n  时代: 匠星初燃\r\n  地区: 普里莫迪亚\r\n  当前历法:\r\n    年: 1303\r\n    月份序号: 3\r\n    月份名: 解冻月\r\n    季节: 初春\r\n    日: 10\r\n    天气: 阳光融雪\r\n    时间: \"06:30\"\r\n  当前地点:\r\n    区域: 布拉姆维克\r\n    具体位置: 酒馆大厅\r\n\r\n酒馆:\r\n  名称: 铁壶酒馆\r\n  声望:\r\n    数值: 0\r\n    阶段: 1\r\n    名称: 无人知晓\r\n    乘数: 0\r\n    范围: 本地\r\n  声望值: 0\r\n  声望名: 无人知晓\r\n  资金:\r\n    随身钱袋:\r\n      铜币: 500\r\n      银币: 0\r\n      金币: 0\r\n      铂金币: 0\r\n      秘银币: 0\r\n      折算合计铜币: 500\r\n    钱匣:\r\n      铜币: 5500\r\n      银币: 0\r\n      金币: 0\r\n      铂金币: 0\r\n      秘银币: 0\r\n      折算合计铜币: 5500\r\n    铜币: 6000\r\n    银币: 0\r\n    金币: 0\r\n    铂金币: 0\r\n    秘银币: 0\r\n    折算合计铜币: 6000\r\n  今日营业状态: 准备营业\r\n  整体概况: 磨坊渡村口的老酒馆，石砌外墙爬满枯藤，屋檐下的铁招牌在融雪风中轻轻晃荡。大厅能坐二十来人，后院有口老水井和三间客房。\r\n  区域:\r\n    大厅:\r\n      状态: 整洁\r\n      状态原因: 清晨刚打扫过\r\n      风格: 乡村木石混搭\r\n      描述: 石板地面，六张橡木桌配长凳，靠墙有壁炉，炉火刚生起来。吧台是整块老榆木，后面墙上挂着几排锡酒杯。\r\n      分配员工: 待定\r\n      设施:\r\n        壁炉:\r\n          状态: 良好\r\n          风格: 石砌乡村风\r\n          描述: 河石垒砌的壁炉，烟道通畅，炉膛里堆着劈好的松木柴。\r\n          价格折合铜币: 0\r\n        吧台:\r\n          状态: 整洁\r\n          风格: 老榆木原色\r\n          描述: 整块老榆木打磨的吧台，台面上有年深日久的杯底印痕，后面是酒桶架和杯架。\r\n          价格折合铜币: 0\r\n    厨房:\r\n      状态: 整洁\r\n      状态原因: 昨晚收拾干净\r\n      风格: 实用乡村厨房\r\n      描述: 石板灶台，铁锅三口，烤炉一座。墙角堆着柴火，窗边挂着干香草和蒜辫。石砌水槽连着后院水井的手压泵。\r\n      分配员工: 待定\r\n      设施:\r\n        铁灶:\r\n          状态: 良好\r\n          风格: 铸铁实用\r\n          描述: 三眼铸铁灶台，带烤炉，烧柴火。灶面有长年油渍沁出的暗色纹路。\r\n          价格折合铜币: 0\r\n        水槽:\r\n          状态: 良好\r\n          风格: 石砌\r\n          描述: 石砌水槽连通后院手压泵，冷水随时可取。\r\n          价格折合铜币: 0\r\n    后院:\r\n      状态: 整洁\r\n      状态原因: 融雪后地面湿漉但干净\r\n      风格: 乡村院落\r\n      描述: 夯土地面，一口老水井带手压泵。院角堆着劈好的柴火垛，另一边是晾衣绳和鸡舍。客房在院子东侧，马厩在西侧。\r\n      分配员工: 待定\r\n      设施:\r\n        水井:\r\n          状态: 良好\r\n          风格: 石砌老井\r\n          描述: 石砌井圈，水质清冽，带黄铜手压泵。井口盖着厚木板防落叶。\r\n          价格折合铜币: 0\r\n        柴火垛:\r\n          状态: 良好\r\n          风格: 实用\r\n          描述: 劈好的松木和橡木柴火，码放整齐，用旧帆布半盖着防雨。\r\n          价格折合铜币: 0\r\n    储物地窖:\r\n      状态: 整洁\r\n      状态原因: 定期整理\r\n      风格: 石砌地下储藏\r\n      描述: 从厨房楼梯下去的石砌地窖，阴凉干燥。木架上码着食材和酒桶，墙上有通风口。\r\n      分配员工: 待定\r\n      设施:\r\n        食材架:\r\n          状态: 良好\r\n          风格: 松木架\r\n          描述: 三层松木货架，分类码放食材和调料。\r\n          价格折合铜币: 0\r\n        酒桶架:\r\n          状态: 良好\r\n          风格: 橡木架\r\n          描述: 倾斜橡木架，架着三桶酒，桶底有黄铜龙头。\r\n          价格折合铜币: 0\r\n    客房走廊:\r\n      状态: 整洁\r\n      状态原因: 早上清扫过\r\n      风格: 乡村简朴\r\n      描述: 连接三间客房的短走廊，木地板踩上去会吱呀响。墙上有两盏油灯。\r\n      分配员工: 待定\r\n      设施:\r\n        油灯:\r\n          状态: 良好\r\n          风格: 黄铜挂灯\r\n          描述: 两盏黄铜挂墙油灯，灯油加满。\r\n          价格折合铜币: 0\r\n  客房:\r\n    橡木房:\r\n      所属区域: 客房走廊\r\n      类型: 单人间\r\n      住客: 无\r\n      清洁状态: 干净\r\n      清洁原因: 昨日换过床单\r\n      舒适描述: 朝南，阳光照在橡木床架上。床垫是荞麦壳填充的，枕头松软。窗台摆了一盆干薰衣草。\r\n      私密描述: 木门带铁插销，窗户有粗麻窗帘。\r\n      价格描述: 一晚30铜币，含早餐。\r\n      设施:\r\n        橡木床:\r\n          状态: 良好\r\n          风格: 橡木手工\r\n          描述: 手工打造的橡木床架，荞麦壳床垫，羊毛毯和亚麻床单。\r\n          价格折合铜币: 0\r\n        床头柜:\r\n          状态: 良好\r\n          风格: 松木\r\n          描述: 小松木柜，抽屉里空着，台面上有烛台和火镰。\r\n          价格折合铜币: 0\r\n    松木房:\r\n      所属区域: 客房走廊\r\n      类型: 双人间\r\n      住客: 无\r\n      清洁状态: 干净\r\n      清洁原因: 三日前换过，尚未有人入住\r\n      舒适描述: 朝东，清晨阳光最先照进来。松木家具散发着淡淡的树脂味。两张床之间有小桌。\r\n      私密描述: 木门带铁插销，窗户有粗麻窗帘。靠走廊的墙是石砌的，隔音不错。\r\n      价格描述: 一晚50铜币，含早餐。\r\n      设施:\r\n        松木床:\r\n          状态: 良好\r\n          风格: 松木手工\r\n          描述: 两张手工松木床架，荞麦壳床垫，羊毛毯和亚麻床单。\r\n          价格折合铜币: 0\r\n        小桌:\r\n          状态: 良好\r\n          风格: 松木\r\n          描述: 两张床之间的松木小桌，配两把木椅。\r\n          价格折合铜币: 0\r\n    桦木房:\r\n      所属区域: 客房走廊\r\n      类型: 单人间\r\n      住客: 无\r\n      清洁状态: 良好\r\n      清洁原因: 一周前换过床单，略有灰尘\r\n      舒适描述: 朝北，最小的一间。桦木家具颜色浅淡，房间紧凑但暖和，紧挨着厨房烟道。\r\n      私密描述: 木门带铁插销，窗户有粗麻窗帘。\r\n      价格描述: 一晚25铜币，不含早餐。\r\n      设施:\r\n        桦木床:\r\n          状态: 良好\r\n          风格: 桦木手工\r\n          描述: 手工桦木床架，荞麦壳床垫，羊毛毯和亚麻床单。\r\n          价格折合铜币: 0\r\n        壁柜:\r\n          状态: 良好\r\n          风格: 桦木\r\n          描述: 嵌入墙体的桦木壁柜，内有三个挂钩和一层隔板。\r\n          价格折合铜币: 0\r\n\r\n主角:\r\n  姓名: \"{{user}}\"\r\n  种族: 人类\r\n  称号: 酒馆老板\r\n  当前状态: 刚起床，正在厨房生火\r\n  一句话穿着: 亚麻衬衫卷着袖子，系牛皮围裙，袖口沾着面粉\r\n  生命:\r\n    当前值: 100\r\n    上限: 100\r\n  精力:\r\n    当前值: 100\r\n    上限: 100\r\n  烹饪等级:\r\n    等级: 1\r\n    称号: 学徒帮工\r\n    做菜次数: 0\r\n    下级所需次数: 20\r\n\r\n库房:\r\n  食材:\r\n    小麦粉:\r\n      数量: 3\r\n      每件份数: 10\r\n      当前剩余份数: 10\r\n      标签:\r\n        - 主食\r\n        - 谷物\r\n      价格折合铜币: 30\r\n    黑面包:\r\n      数量: 5\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 主食\r\n        - 烘焙\r\n      价格折合铜币: 8\r\n    鸡蛋:\r\n      数量: 24\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 禽蛋\r\n      价格折合铜币: 2\r\n    牛奶:\r\n      数量: 2\r\n      每件份数: 8\r\n      当前剩余份数: 8\r\n      标签:\r\n        - 乳品\r\n      价格折合铜币: 16\r\n    黄油:\r\n      数量: 1\r\n      每件份数: 20\r\n      当前剩余份数: 16\r\n      标签:\r\n        - 乳品\r\n        - 油脂\r\n      价格折合铜币: 25\r\n    土豆:\r\n      数量: 15\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 蔬菜\r\n        - 根茎\r\n      价格折合铜币: 1\r\n    洋葱:\r\n      数量: 10\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 蔬菜\r\n      价格折合铜币: 1\r\n    胡萝卜:\r\n      数量: 12\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 蔬菜\r\n        - 根茎\r\n      价格折合铜币: 1\r\n    卷心菜:\r\n      数量: 3\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 蔬菜\r\n        - 叶菜\r\n      价格折合铜币: 5\r\n    牛肉:\r\n      数量: 2\r\n      每件份数: 6\r\n      当前剩余份数: 5\r\n      标签:\r\n        - 肉类\r\n        - 红肉\r\n      价格折合铜币: 60\r\n    猪肉:\r\n      数量: 3\r\n      每件份数: 5\r\n      当前剩余份数: 4\r\n      标签:\r\n        - 肉类\r\n        - 红肉\r\n      价格折合铜币: 40\r\n    鸡肉:\r\n      数量: 2\r\n      每件份数: 4\r\n      当前剩余份数: 4\r\n      标签:\r\n        - 肉类\r\n        - 禽肉\r\n      价格折合铜币: 25\r\n    河鱼:\r\n      数量: 4\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 水产\r\n        - 河鲜\r\n      价格折合铜币: 12\r\n    干豆:\r\n      数量: 1\r\n      每件份数: 20\r\n      当前剩余份数: 18\r\n      标签:\r\n        - 豆类\r\n      价格折合铜币: 15\r\n  调料:\r\n    盐:\r\n      数量: 1\r\n      每件份数: 50\r\n      当前剩余份数: 42\r\n      标签:\r\n        - 基础调料\r\n      价格折合铜币: 20\r\n    黑胡椒:\r\n      数量: 1\r\n      每件份数: 30\r\n      当前剩余份数: 25\r\n      标签:\r\n        - 香料\r\n        - 贵重\r\n      价格折合铜币: 45\r\n    干香草:\r\n      数量: 1\r\n      每件份数: 15\r\n      当前剩余份数: 12\r\n      标签:\r\n        - 香草\r\n      价格折合铜币: 10\r\n    蒜:\r\n      数量: 5\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 调味\r\n      价格折合铜币: 1\r\n    蜂蜜:\r\n      数量: 1\r\n      每件份数: 25\r\n      当前剩余份数: 20\r\n      标签:\r\n        - 甜味剂\r\n      价格折合铜币: 30\r\n  成品: {}\r\n  酒水:\r\n    麦酒:\r\n      数量: 2\r\n      每件份数: 20\r\n      当前剩余份数: 18\r\n      标签:\r\n        - 啤酒\r\n        - 低度\r\n      价格折合铜币: 80\r\n      搭配判定: 经典搭配\r\n    苹果酒:\r\n      数量: 1\r\n      每件份数: 15\r\n      当前剩余份数: 15\r\n      标签:\r\n        - 果酒\r\n        - 低度\r\n      价格折合铜币: 60\r\n      搭配判定: 无冲突\r\n    蜂蜜酒:\r\n      数量: 1\r\n      每件份数: 10\r\n      当前剩余份数: 10\r\n      标签:\r\n        - 蜜酒\r\n        - 中度\r\n      价格折合铜币: 100\r\n      搭配判定: 经典搭配\r\n  杂物:\r\n    蜡烛:\r\n      数量: 12\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 照明\r\n      价格折合铜币: 2\r\n    木柴:\r\n      数量: 1\r\n      每件份数: 30\r\n      当前剩余份数: 25\r\n      标签:\r\n        - 燃料\r\n      价格折合铜币: 15\r\n    灯油:\r\n      数量: 1\r\n      每件份数: 20\r\n      当前剩余份数: 16\r\n      标签:\r\n        - 照明\r\n        - 燃料\r\n      价格折合铜币: 25\r\n  日用品:\r\n    肥皂:\r\n      数量: 3\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 清洁\r\n      价格折合铜币: 5\r\n    抹布:\r\n      数量: 6\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 清洁\r\n      价格折合铜币: 1\r\n    陶碗:\r\n      数量: 20\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 餐具\r\n      价格折合铜币: 3\r\n    锡酒杯:\r\n      数量: 15\r\n      每件份数: 1\r\n      当前剩余份数: 1\r\n      标签:\r\n        - 酒具\r\n      价格折合铜币: 8\r\n\r\n行囊:\r\n  食材: {}\r\n  调料: {}\r\n  成品: {}\r\n  酒水: {}\r\n  杂物: {}\r\n\r\n临时状态:\r\n  主角: []\r\n  酒馆: []\r\n  酒馆区域: {}\r\n  人物: {}\r\n\r\n人物羁绊:\r\n  橘柒:\r\n    种族: 狐族\r\n    身份: 求职者\r\n    羁绊阶段: 1\r\n    阶段文字: 陌生人\r\n    好感: 0\r\n    心情: 疲惫但好奇\r\n    所在位置: 酒馆大厅门口\r\n    一句话穿着: 起球深灰旧斗篷，内穿绥和式斜襟短打上衣，宽松灯笼裤，兽爪半靴\r\n    生命:\r\n      当前值: 100\r\n      上限: 100\r\n    精力:\r\n      当前值: 45\r\n      上限: 100\r\n    膀胱:\r\n      当前值: 15\r\n      上限: 100\r\n    个人资金:\r\n      铜币: 8\r\n      银币: 0\r\n      金币: 0\r\n      铂金币: 0\r\n      秘银币: 0\r\n      折算合计铜币: 8\r\n    收入:\r\n      职业: 无\r\n      日收入折合铜币: 0\r\n      结算方式: 无\r\n      备注: 身无分文的流浪少女\r\n    备注: 从绥和诸邦萩岭出发半年，目标克朗港铁心脏，路费花光滞留布拉姆维克\r\n\r\n农田与酒窖:\r\n  农田: {}\r\n  酒窖桶: {}\r\n\r\n布草库存:\r\n  床单:\r\n    总数: 6\r\n    干净可用: 4\r\n    脏污待洗: 2\r\n    晾晒中: 0\r\n  枕套:\r\n    总数: 6\r\n    干净可用: 5\r\n    脏污待洗: 1\r\n    晾晒中: 0\r\n  毛巾:\r\n    总数: 8\r\n    干净可用: 6\r\n    脏污待洗: 2\r\n    晾晒中: 0\r\n  桌布:\r\n    总数: 4\r\n    干净可用: 3\r\n    脏污待洗: 1\r\n    晾晒中: 0\r\n  抹布:\r\n    总数: 10\r\n    干净可用: 7\r\n    脏污待洗: 3\r\n    晾晒中: 0\r\n\r\n晾晒:\r\n  晾晒中: {}\r\n\r\n厩舍:\r\n  状态: 整洁\r\n  风格: 简易木棚\r\n  描述: 后院西侧的木棚马厩，能拴两匹马。地上铺着干草，角落有饲料槽和水桶。\r\n  容量: 2\r\n  当前载具数: 0\r\n  载具: {}\r\n  饲料储备:\r\n    干草:\r\n      数量: 2\r\n      每件份数: 10\r\n      当前剩余份数: 10\r\n      标签:\r\n        - 粗饲料\r\n      价格折合铜币: 10\r\n\r\n禽畜圈养:\r\n  圈舍状态: 整洁\r\n  圈舍风格: 简易鸡舍\r\n  圈舍描述: 后院角落的木板鸡舍，围了铁丝网。五只母鸡，每天能捡三四颗蛋。\r\n  禽畜:\r\n    母鸡:\r\n      类型: 禽类\r\n      品种: 洛恩灰羽鸡\r\n      数量: 5\r\n      成长阶段: 成年\r\n      产出物: 鸡蛋\r\n      产出周期: 每日\r\n      上次产出日: 12\r\n      饲料需求: 谷物碎屑、菜叶\r\n      健康状况: 良好\r\n      备注: 其中一只最近下蛋少了，可能是年纪大了\r\n  饲料储备:\r\n    谷物碎屑:\r\n      数量: 1\r\n      每件份数: 15\r\n      当前剩余份数: 10\r\n      标签:\r\n        - 禽饲料\r\n      价格折合铜币: 5\r\n\r\n街坊商铺:\r\n  当前商铺: \"\"\r\n版本二：绵暖（羊族酿造师学徒）\r\n\r\n人物羁绊部分替换为：\r\n\r\n人物羁绊:\r\n  绵暖:\r\n    种族: 羊族（瓦莱黑鼻羊型）\r\n    身份: 酿造师公会推销学徒\r\n    羁绊阶段: 1\r\n    阶段文字: 陌生人\r\n    好感: 0\r\n    心情: 紧张忐忑\r\n    所在位置: 酒馆大厅门口\r\n    一句话穿着: 深灰蓝色收腰短大衣，浅蓝色薄棉宽松衫，白色灯笼裤，脖子挂木牌，背上木箱\r\n    生命:\r\n      当前值: 100\r\n      上限: 100\r\n    精力:\r\n      当前值: 70\r\n      上限: 100\r\n    膀胱:\r\n      当前值: 10\r\n      上限: 100\r\n    个人资金:\r\n      铜币: 200\r\n      银币: 5\r\n      金币: 1\r\n      铂金币: 0\r\n      秘银币: 0\r\n      折算合计铜币: 1700\r\n    收入:\r\n      职业: 酿造师公会推销学徒\r\n      日收入折合铜币: 40\r\n      结算方式: 月结\r\n      备注: 养母阿黛拉为韦斯托利亚分部品鉴执事\r\n    备注: 从牧坡随养母迁至韦斯托利亚不到一周，正在跑南部小村庄建立渠道，背上木箱装着公会酒样\r\n其余全部同版本一。\r\n\r\n版本三：翠萱（鹿族药剂师）\r\n\r\n人物羁绊部分替换为：\r\n\r\n人物羁绊:\r\n  翠萱:\r\n    种族: 鹿族（梅花鹿型）\r\n    身份: 药剂师公会初级药剂师\r\n    羁绊阶段: 1\r\n    阶段文字: 陌生人\r\n    好感: 0\r\n    心情: 平静偏疲惫\r\n    所在位置: 酒馆大厅柜台前\r\n    一句话穿着: 药剂师公会深绿学徒袍，灰褐帆布大背包，腰间皮革挎包，棕色蹄套\r\n    生命:\r\n      当前值: 100\r\n      上限: 100\r\n    精力:\r\n      当前值: 55\r\n      上限: 100\r\n    膀胱:\r\n      当前值: 20\r\n      上限: 100\r\n    个人资金:\r\n      铜币: 150\r\n      银币: 3\r\n      金币: 0\r\n      铂金币: 0\r\n      秘银币: 0\r\n      折算合计铜币: 450\r\n    收入:\r\n      职业: 药剂师公会初级药剂师\r\n      日收入折合铜币: 50\r\n      结算方式: 月结\r\n      备注: 公会韦斯托利亚分部派驻南部丘陵区\r\n    备注: 今日从费尔马克步行抵达布拉姆维克，被公会派往南部丘陵区采集深界浅层草药样本，第一天到达\r\n其余全部同版本一。\r\n\r\n版本四：莲洵+莲沁（兔族双胞胎）\r\n\r\n人物羁绊部分替换为：\r\n\r\n人物羁绊:\r\n  莲洵:\r\n    种族: 兔族\r\n    身份: 自由舞者\r\n    羁绊阶段: 1\r\n    阶段文字: 陌生人\r\n    好感: 0\r\n    心情: 兴奋好奇\r\n    所在位置: 酒馆大厅柜台前\r\n    一句话穿着: 月白素绉缎交领短衫暗织竹叶纹，八分阔腿裤，薄底软皮便鞋，斜背蜜色软皮挎包\r\n    生命:\r\n      当前值: 100\r\n      上限: 100\r\n    精力:\r\n      当前值: 75\r\n      上限: 100\r\n    膀胱:\r\n      当前值: 15\r\n      上限: 100\r\n    个人资金:\r\n      铜币: 500\r\n      银币: 5\r\n      金币: 2\r\n      铂金币: 0\r\n      秘银币: 0\r\n      折算合计铜币: 3000\r\n    收入:\r\n      职业: 自由舞者\r\n      日收入折合铜币: 0\r\n      结算方式: 不固定\r\n      备注: 父亲是莲露城粮食贸易商，旅费充裕\r\n    备注: 同卵双胞胎姐姐，左胸外侧深褐色小痣，与妹妹莲沁同行旅行，从兽族联邦兔邦莲露城出发\r\n  莲沁:\r\n    种族: 兔族\r\n    身份: 自由舞者\r\n    羁绊阶段: 1\r\n    阶段文字: 陌生人\r\n    好感: 0\r\n    心情: 安静观察\r\n    所在位置: 酒馆大厅柜台前\r\n    一句话穿着: 灰白素绉缎交领短衫无暗纹，八分阔腿裤，薄底软皮便鞋，斜背烟灰色软皮挎包\r\n    生命:\r\n      当前值: 100\r\n      上限: 100\r\n    精力:\r\n      当前值: 80\r\n      上限: 100\r\n    膀胱:\r\n      当前值: 10\r\n      上限: 100\r\n    个人资金:\r\n      铜币: 300\r\n      银币: 5\r\n      金币: 2\r\n      铂金币: 0\r\n      秘银币: 0\r\n      折算合计铜币: 2800\r\n    收入:\r\n      职业: 自由舞者\r\n      日收入折合铜币: 0\r\n      结算方式: 不固定\r\n      备注: 父亲是莲露城粮食贸易商，旅费充裕\r\n    备注: 同卵双胞胎妹妹，胸前无痣（区分标记），与姐姐莲洵同行旅行，从兽族联邦兔邦莲露城出发";

function clonePlainData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function setStoredItemQty(store: Record<string, any>, category: string, itemName: string, qty: number, remaining?: number) {
  const item = store?.['库房']?.[category]?.[itemName];
  if (!item) return;
  item['数量'] = qty;
  if (typeof remaining === 'number') item['当前剩余份数'] = remaining;
}

function deleteStoredItem(store: Record<string, any>, category: string, itemName: string) {
  delete store?.['库房']?.[category]?.[itemName];
}

function reduceOpeningEconomy(store: Record<string, any>) {
  const money = store?.['酒馆']?.['资金'];
  if (money) {
    Object.assign(money['随身钱袋'], {
      铜币: 180,
      折算合计铜币: 180,
    });
    Object.assign(money['钱匣'], {
      铜币: 1320,
      折算合计铜币: 1320,
    });
    Object.assign(money, {
      铜币: 1500,
      折算合计铜币: 1500,
    });
  }

  setStoredItemQty(store, '食材', '小麦粉', 1, 8);
  setStoredItemQty(store, '食材', '黑面包', 2);
  setStoredItemQty(store, '食材', '鸡蛋', 8);
  setStoredItemQty(store, '食材', '牛奶', 1, 4);
  deleteStoredItem(store, '食材', '黄油');
  setStoredItemQty(store, '食材', '土豆', 6);
  setStoredItemQty(store, '食材', '洋葱', 4);
  setStoredItemQty(store, '食材', '胡萝卜', 5);
  setStoredItemQty(store, '食材', '卷心菜', 1);
  deleteStoredItem(store, '食材', '牛肉');
  setStoredItemQty(store, '食材', '猪肉', 1, 3);
  setStoredItemQty(store, '食材', '鸡肉', 1, 3);
  setStoredItemQty(store, '食材', '河鱼', 2);
  setStoredItemQty(store, '食材', '干豆', 1, 8);

  setStoredItemQty(store, '调料', '盐', 1, 20);
  deleteStoredItem(store, '调料', '黑胡椒');
  setStoredItemQty(store, '调料', '干香草', 1, 6);
  setStoredItemQty(store, '调料', '蒜', 2);
  deleteStoredItem(store, '调料', '蜂蜜');

  setStoredItemQty(store, '酒水', '麦酒', 1, 12);
  deleteStoredItem(store, '酒水', '苹果酒');
  deleteStoredItem(store, '酒水', '蜂蜜酒');

  setStoredItemQty(store, '杂物', '蜡烛', 6);
  setStoredItemQty(store, '杂物', '木柴', 1, 14);
  setStoredItemQty(store, '杂物', '灯油', 1, 8);
  setStoredItemQty(store, '日用品', '肥皂', 1);
  setStoredItemQty(store, '日用品', '抹布', 4);
  setStoredItemQty(store, '日用品', '陶碗', 12);
  setStoredItemQty(store, '日用品', '锡酒杯', 8);
}

function parseFixedOpeningSections() {
  const versionRe = new RegExp('^\\u7248\\u672c[\\u4e00\\u4e8c\\u4e09\\u56db]\\uff1a.*$', 'gm');
  const markers = [...FIXED_OPENING_INITVAR_SOURCE.matchAll(versionRe)].map(match => ({
    index: match.index ?? 0,
    title: match[0],
  }));
  if (markers.length < 4) throw new Error('Fixed opening initvar source is missing one or more versions.');

  return markers.map((marker, index) => {
    const start = marker.index + marker.title.length;
    const end = markers[index + 1]?.index ?? FIXED_OPENING_INITVAR_SOURCE.length;
    const body = FIXED_OPENING_INITVAR_SOURCE.slice(start, end)
      .trim()
      .replace(new RegExp('^\\u4eba\\u7269\\u7f81\\u7eca\\u90e8\\u5206\\u66ff\\u6362\\u4e3a\\uff1a\\s*', 'm'), '')
      .replace(new RegExp('\\n\\u5176\\u4f59\\u5168\\u90e8\\u540c\\u7248\\u672c\\u4e00\\u3002\\s*$', 'm'), '')
      .trim();
    const data = parseYaml(body) as Record<string, any>;
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Fixed opening initvar did not parse as an object.');
    return data;
  });
}

const FIXED_OPENING_INITVARS = (() => {
  const [fox, sheepPatch, deerPatch, twinsPatch] = parseFixedOpeningSections();
  reduceOpeningEconomy(fox);
  const relationshipKey = '\u4eba\u7269\u7f81\u7eca';
  const withCharacterPatch = (patch: Record<string, any>, time: string) => {
    const next = clonePlainData(fox);
    next[relationshipKey] = clonePlainData(patch[relationshipKey] ?? {});
    next['世界']['当前历法']['时间'] = time;
    return next;
  };
  const foxOpening = clonePlainData(fox);
  foxOpening['世界']['当前历法']['时间'] = '06:30';
  foxOpening[relationshipKey]['橘柒']['收入']['备注'] = '身无分文的狐族少女';

  return {
    fox: foxOpening,
    sheep: withCharacterPatch(sheepPatch, '11:30'),
    deer: withCharacterPatch(deerPatch, '17:30'),
    twins: withCharacterPatch(twinsPatch, '14:30'),
  } satisfies Record<FixedOpeningInitvarKind, Record<string, any>>;
})();

export function fixedOpeningInitvar(kind: FixedOpeningInitvarKind) {
  return clonePlainData(FIXED_OPENING_INITVARS[kind]);
}

export function fixedOpeningInitvarYaml(kind: FixedOpeningInitvarKind) {
  return stringifyYaml(FIXED_OPENING_INITVARS[kind]).trim();
}

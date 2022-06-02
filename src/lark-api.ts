/*
 * lark-api.ts
 * Created on Thu Sep 02 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import path from 'path';
import got from 'got';
import cheerio from 'cheerio';
import axios from 'axios';
import qs from 'querystring';

export interface LarkUser {
	name: string;
	clan: string;
	expLevel: number;
	level: number;
	itemLevel: number;
	server: string;
	class: string;
	offense: number;
	life: number;
	battle: { text: string, value: string }[];
	engrave: { text: string, value: string }[];
    gems: LarkGem[];
    weapons: LarkWeapon[];
    accessories: LarkAccessory[];
}

declare global {
    interface String {
        text(): string;
        toCDN(): string;
    }
}

export type LarkGemElement = {
    Element_000: {
        type: 'NameTagBox';
        value: string; // "<P ALIGN='CENTER'><FONT COLOR='#F99200'>7레벨 홍염의 보석</FONT></P>"
    };

    Element_001: {
        type: 'ItemTitle',
        value: {
            leftStr0: string; //"<FONT SIZE='12'><FONT COLOR='#F99200'>전설 보석</FONT></FONT>",
            leftStr2: string; //"<FONT SIZE='14'>아이템 티어 3</FONT>",
            qualityValue: number;
            rightStr0: string;
            slotData: {
                advBookIcon: number;
                friendship: number;
                iconGrade: number;
                iconPath: string; //'EFUI_IconAtlas/Use/Use_9_62.png',
                imagePath: string;
                islandIcon: number;
                rtString: string; //'Lv.7',
                seal: boolean;
                temporary: number;
                town: number;
                trash: number;
            };
        };
    };

    Element_002: { type: 'MultiTextBox', value: string /*'|거래가능'*/ },
    Element_003: { type: 'SingleTextBox', value: string /*'보석 레벨 7'*/ },
    Element_004: {
        type: 'ItemPartBox',
        value: {
            Element_000: string; //"<FONT COLOR='#A9D0F5'>효과</FONT>",
            Element_001: string; //"[리퍼] <FONT COLOR='#FFD200'>쉐도우 닷</FONT> 재사용 대기시간 14.00% 감소"
        }
    },
    Element_005: {
        type: 'SingleTextBox',
        value: string; //"<FONT SIZE='12'><FONT COLOR='#C24B46'>분해불가</FONT></FONT>"
    }
}

export type LarkGem = {
    level: string;
    iconPath: string;
    title: string;
    effect: {
      job: string;
      skill: string;
      description: string;
      value: number;
      description2: string;
    };
}

export type LarkWeaponElement = {
    "Element_000": {
        "type": "NameTagBox",
        "value": string; //"<P ALIGN='CENTER'><FONT COLOR='#FA5D00'>+17 메마른 사멸의 밤 대거</FONT></P>"
    },
    "Element_001": {
        "type": "ItemTitle",
        "value": {
            "leftStr0": string; //"<FONT SIZE='12'><FONT COLOR='#FA5D00'>유물 대거</FONT></FONT>",
            "leftStr1": string; //"<FONT SIZE='14'>품질</FONT>",
            "leftStr2": string; //"<FONT SIZE='14'>아이템 레벨 1560 (티어 3)</FONT>",
            "qualityValue": number; //87,
            "rightStr0": string; //"<FONT SIZE='12'><FONT COLOR='#FFD200'>장착중</FONT></FONT>",
            "slotData": {
                "advBookIcon": number; //0,
                "friendship": number; //0,
                "iconGrade": number; //5,
                "iconPath": string; //"EFUI_IconAtlas/DRP_item/DRP_Item_151.png",
                "imagePath": string; //"",
                "islandIcon": number; //0,
                "rtString": string; //"",
                "seal": boolean; //false,
                "temporary": number; //0,
                "town": number; //0,
                "trash": number; //0
            }
        }
    },
    "Element_002": {
        "type": "SingleTextBox",
        "value": string; //"<FONT SIZE='12'>리퍼 전용</FONT>"
    },
    "Element_003": {
        "type": "SingleTextBox",
        "value": string; //"<FONT SIZE='12'>귀속됨</FONT>"
    },
    "Element_004": {
        "type": "MultiTextBox",
        "value": string; //"|<font color='#C24B46'>거래 불가</font>"
    },
    "Element_005": {
        "type": "ItemPartBox",
        "value": {
            "Element_000": string; //"<FONT COLOR='#A9D0F5'>기본 효과</FONT>",
            "Element_001": string; //"무기 공격력 +43696"
        }
    },
    "Element_006": {
        "type": "ItemPartBox",
        "value": {
            "Element_000": string; //"<FONT COLOR='#A9D0F5'>추가 효과</FONT>",
            "Element_001": string; //"추가 피해 +25.14%"
        }
    },
    "Element_007": {
        "type": "Progress",
        "value": {
            "forceValue": string; //"장비 재련 가능",
            "maximum": number; //180000,
            "minimum": number; //0,
            "title": string; //"<FONT SIZE='12'><FONT COLOR='#A9D0F5'>현재 단계 재련 경험치</FONT></FONT>",
            "value": number; //180000,
            "valueType": number; //-1
        }
    },
    "Element_008": {
        "type": "IndentStringGroup",
        "value": {
            "Element_000": {
                "contentStr": {
                    "Element_000": {
                        "bPoint": boolean; //false,
                        "contentStr": string; //"[리퍼] [<FONT COLOR='#FFD200'>디스토션</FONT>] 빠른 준비 <FONT COLOR='#73dc04'>Lv +3</FONT>",
                        "pointType": number; //1
                    },
                    "Element_001": {
                        "bPoint": boolean; // false,
                        "contentStr": string; //"[리퍼] [<FONT COLOR='#FFD200'>사일런트 스매셔</FONT>] 지면 강타 <FONT COLOR='#73dc04'>Lv +3</FONT>",
                        "pointType": number; //1
                    },
                    "Element_002": {
                        "bPoint": boolean; //false,
                        "contentStr": string; //"[리퍼] [<FONT COLOR='#FFD200'>라스트 그래피티</FONT>] 급소 타격 <FONT COLOR='#73dc04'>Lv +3</FONT>",
                        "pointType": number; //1
                    }
                },
                "topStr": string; //"<FONT COLOR='#A9D0F5'>트라이포드 효과</FONT>"
            }
        }
    },
    "Element_009": {
        "type": "ItemPartBox",
        "value": {
            "Element_000": string; //"<FONT COLOR='#A9D0F5'>세트 효과 레벨</FONT>",
            "Element_001": string; //"사멸 <FONT COLOR='#FFD200'>Lv.2</FONT>"
        }
    },
    "Element_010": {
        "type": "IndentStringGroup",
        "value": {
            "Element_000": {
                "contentStr": {
                    "Element_000": {
                        "bPoint": boolean; //false,
                        "contentStr": string; //"<font size='12'>사멸 (대거)</font> [<FONT COLOR='#FFD200'>Lv.2</FONT>]"
                    },
                    "Element_001": {
                        "bPoint": boolean; //false,
                        "contentStr": string; //"<font size='12'>사멸 (머리 방어구)</font> [<FONT COLOR='#FFD200'>Lv.2</FONT>]"
                    },
                    "Element_002": {
                        "bPoint": boolean; //false,
                        "contentStr": string; //"<font size='12'>사멸 (상의)</font> [<FONT COLOR='#FFD200'>Lv.1</FONT>]"
                    },
                    "Element_003": {
                        "bPoint": boolean; //false,
                        "contentStr": string; //"<font size='12'>사멸 (하의)</font> [<FONT COLOR='#FFD200'>Lv.2</FONT>]"
                    },
                    "Element_004": {
                        "bPoint": boolean; //false,
                        "contentStr": string; //"<font size='12'>사멸 (장갑)</font> [<FONT COLOR='#FFD200'>Lv.2</FONT>]"
                    },
                    "Element_005": {
                        "bPoint": boolean; //false,
                        "contentStr": string; //"<font size='12'>사멸 (어깨 방어구)</font> [<FONT COLOR='#FFD200'>Lv.2</FONT>]"
                    }
                },
                "topStr": string; //"<font size='14'><font color='#91fe02'>사멸</font></font>"
            },
            "Element_001": {
                "contentStr": {
                    "Element_000": {
                        "bPoint": boolean; //true,
                        "contentStr": string; //"<font size='12'><font color='#ffffff'>치명타 피해가 <FONT COLOR='#99FF99'>20%</FONT> 증가한다.<BR>백어택 및 헤드어택 공격 적중 시 치명타 피해 증가 수치가 <FONT COLOR='#99FF99'>60%</FONT>로 적용된다.</font></font>"
                    }
                },
                "topStr": string; //"<font size='14'><font color='#91fe02'>2 세트 효과<BR>[<font size='14'><font color='#aaaaaa'>Lv.1 / <FONT COLOR='#FFD200'>Lv.2</FONT> / Lv.3</font></font>]</font></font>"
            },
            "Element_002": {
                "contentStr": {
                    "Element_000": {
                        "bPoint": boolean; //true,
                        "contentStr": string; //"<font size='12'><font color='#ffffff'>치명타 적중률이 <FONT COLOR='#99FF99'>20%</FONT> 증가한다.</font></font>"
                    }
                },
                "topStr": string; //"<font size='14'><font color='#91fe02'>4 세트 효과<BR>[<font size='14'><font color='#aaaaaa'>Lv.1 / <FONT COLOR='#FFD200'>Lv.2</FONT> / Lv.3</font></font>]</font></font>"
            },
            "Element_003": {
                "contentStr": {
                    "Element_000": {
                        "bPoint": boolean; //true,
                        "contentStr": string; //"<font size='12'><font color='#ffffff'>적에게 주는 피해가 <FONT COLOR='#99ff99'>7%</FONT> 증가한다.<BR>백어택 및 헤드어택 공격 적중 시 적에게 주는 피해 수치가 <FONT COLOR='#99ff99'>21%</FONT>로 적용된다.</font></font>"
                    }
                },
                "topStr": string; //"<font size='14'><font color='#91fe02'>6 세트 효과<BR>[<font size='14'><font color='#aaaaaa'><FONT COLOR='#FFD200'>Lv.1</FONT> / Lv.2 / Lv.3</font></font>]</font></font>"
            }
        }
    },
    "Element_011": {
        "type": "SingleTextBox",
        "value": string; //"<FONT SIZE='12'><FONT COLOR='#C24B46'>분해불가</FONT>, <FONT COLOR='#C24B46'>전승 재료로 사용 불가</FONT></FONT>"
    },
    "Element_012": {
        "type": "SingleTextBox",
        "value": string; //"<Font color='#5FD3F1'>[세트 업그레이드] </font>"
    },
    "Element_013": {
        "type": "ShowMeTheMoney",
        "value": string; //"<FONT SIZE='12'><FONT COLOR='#FFFFFF'>내구도 <FONT COLOR='#FFFFFF'>149 / 169</FONT></FONT></FONT>|"
    }
}

export type LarkWeapon = {
    upgrade: number;
    title: string;
    quality: number;
    iconPath: string;
}

export type LarkAccessoryElement = {
    "Element_000": {
        "type": "NameTagBox",
        "value": string; //"<P ALIGN='CENTER'><FONT COLOR='#FA5D00'>울부짖는 혼돈의 목걸이</FONT></P>"
    },
    "Element_001": {
        "type": "ItemTitle",
        "value": {
            "leftStr0": string; //"<FONT SIZE='12'><FONT COLOR='#FA5D00'>유물 목걸이</FONT></FONT>",
            "leftStr1": string; //"<FONT SIZE='14'>품질</FONT>",
            "leftStr2": string; //"<FONT SIZE='14'>아이템 티어 3</FONT>",
            "qualityValue": number; //94,
            "rightStr0": string; //"<FONT SIZE='12'><FONT COLOR='#FFD200'>장착중</FONT></FONT>",
            "slotData": {
                "advBookIcon": number; //0,
                "friendship": number; //0,
                "iconGrade": number; //5,
                "iconPath": string; //"EFUI_IconAtlas/Acc/Acc_212.png",
                "imagePath": string; //"",
                "islandIcon": number; //0,
                "rtString": string; //"",
                "seal": boolean; //false,
                "temporary": number; //0,
                "town": number; //0,
                "trash": number; //0
            }
        }
    },
    "Element_002": {
        "type": "SingleTextBox",
        "value": string; //"<FONT SIZE='12'>귀속됨<BR>거래 <FONT COLOR='#FFD200'>2</FONT>회 가능<BR><FONT COLOR='#C24B46'>거래 제한 아이템 레벨</FONT> 1415</FONT>"
    },
    "Element_003": {
        "type": "MultiTextBox",
        "value": string; //"|거래가능"
    },
    "Element_004": {
        "type": "ItemPartBox",
        "value": {
            "Element_000": string; //<FONT COLOR='#A9D0F5'>기본 효과</FONT>",
            "Element_001": string; //<FONT COLOR='#686660'>힘 +9872</FONT><BR>민첩 +9872<BR><FONT COLOR='#686660'>지능 +9872</FONT><BR>체력 +2848"
        }
    },
    "Element_005": {
        "type": "ItemPartBox",
        "value": {
            "Element_000": string; //"<FONT COLOR='#A9D0F5'>추가 효과</FONT>",
            "Element_001": string; //"특화 +492<BR>신속 +497"
        }
    },
    "Element_006": {
        "type": "ItemPartBox",
        "value": {
            "Element_000": string; //<FONT COLOR='#A9D0F5'>무작위 각인 효과</FONT>",
            "Element_001": string; //[<FONT COLOR='#FFFFAC'>기습의 대가</FONT>] 활성도 +5<BR>[<FONT COLOR='#FFFFAC'>저주받은 인형</FONT>] 활성도 +3<BR>[<FONT COLOR='#FE2E2E'>공격속도 감소</FONT>] 활성도 +1"
        }
    },
    "Element_007": {
        "type": "SingleTextBox",
        "value": string; //"<FONT SIZE='12'><FONT COLOR='#C24B46'>품질 업그레이드 불가</FONT></FONT>"
    },
    "Element_008": {
        "type": "SingleTextBox",
        "value": string; //"<Font color='#5FD3F1'>[군단장 레이드] 마수군단장 발탄</font><BR><Font color='#5FD3F1'>[군단장 레이드] 욕망군단장 비아키스</font><BR><Font color='#5FD3F1'>[군단장 레이드] 광기군단장 쿠크세이튼</font><BR><Font color='#5FD3F1'>그 외에 획득처가 더 존재합니다.</FONT>"
    }
}

export type LarkAccessory = {
    title: string;
    quality: number;
    iconPath: string;
    defaultStatus: {
        text: string;
        value: number;
    };
    status: { text: string; value: number; }[];
    engrave: { text: string; value: number; }[];
}

String.prototype.text = function(this: string) {
    return cheerio.load(this.replace(/<br>/ig, '\n')).text().trim();
}

String.prototype.toCDN = function(this: string) {
    return 'https://cdn-lostark.game.onstove.com/' + this;
}

const parseWeapon = (weaponList: LarkWeaponElement[]): LarkWeapon[] =>
    weaponList.map((weapon: LarkWeaponElement) => {
        const obj: any = {};
        const nameTag = weapon.Element_000.value.text();
        const nameTagMatch = nameTag.match(/\+(\d+) (.*)/);
        if ( nameTagMatch ) {
            obj.upgrade = +nameTagMatch[1];
            obj.title = nameTagMatch[2];
        }
        obj.quality = weapon.Element_001.value.qualityValue;
        obj.iconPath = weapon.Element_001.value.slotData.iconPath.toCDN();
        return obj as LarkWeapon;
    });

const parseGems = (gemList: LarkGemElement[]): LarkGem[] =>
    gemList.map((gem: LarkGemElement) => {
        const obj: any = {};
        const itemData = gem.Element_001.value;
        obj.level = +itemData.slotData.rtString.replace('Lv.', '');
        obj.iconPath = itemData.slotData.iconPath.toCDN();
        obj.title = gem.Element_000.value.text();
        const itemPart = gem.Element_004.value.Element_001.text();
        const m = itemPart.match(/\[(\W+)?\] (.*?) (재사용 대기시간|피해) (.*?)% (\W+)/);

        if ( m ) {
            obj.effect = {
                job: m[1],
                skill: m[2],
                description: m[3],
                value: +m[4],
                description2: m[5],
            };
        }
        return obj as LarkGem;
    });

const parseAccessories = (accessoryList: LarkAccessoryElement[]): LarkAccessory[] =>
    accessoryList.map((accessory: LarkAccessoryElement) => {
        const obj: any = {};
        obj.title = accessory.Element_000.value.text();
        obj.quality = accessory.Element_001.value.qualityValue;
        obj.iconPath = accessory.Element_001.value.slotData.iconPath.toCDN();

        const defaultStatusMatch = accessory.Element_004.value.Element_001.text().match(/(\W+?) \+(\d+)/);
        if ( defaultStatusMatch ) {
            obj.defaultStatus = {
                text: defaultStatusMatch[1],
                value: +defaultStatusMatch[2],
            };
        }

        obj.status = accessory.Element_005.value.Element_001.text().split('\n')
            .map((element: string) => {
                const o = { text: '', value: 0 };
                const m = element.match(/(\W+?) \+(\d+)/);
                if ( m ) {
                    o.text = m[1];
                    o.value = +m[2];
                }
                return o;
            });

        obj.engrave = accessory.Element_006.value.Element_001.text().split('\n')
            .map((element: string) => {
                const o = { text: '', value: 0 };
                const m = element.match(/\[(.*?)\] 활성도 \+(\d+)/);
                if ( m ) {
                    o.text = m[1];
                    o.value = +m[2];
                }
                return o;
            });
        
        return obj as LarkAccessory;
    });

export class LarkApi {

	private schema: string = 'https://';
	private host: string = 'lostark.game.onstove.com';

	private async req(url: string, ...args: string[]) {
		args.forEach((arg: string, idx: number) => {
			url = url.replaceAll(`{${idx}}`, qs.escape(arg));
		});

		url = this.schema + path.join(this.host, url);
		console.log('url', url);
		let res: any;
		try {
			res = await got.get(url);
		} catch {
			res = await axios.get(url);
			res.body = res.data;
			res.isAxiosRequest = true;
		}
		return res;
	}

	async getUser(name: string): Promise<LarkUser> {
		const res = await this.req('/Profile/Character/{0}', name);
		const $ = cheerio.load(res.body);
		const expLevel = parseInt($('.level-info__expedition').text().match(/Lv\.([0-9,.]*)/)?.[1] as string) || 0;
		const level = parseInt($('.level-info__item').text().match(/Lv\.([0-9,.]*)/)?.[1] as string) || 0;
		const itemLevel = parseFloat($('.level-info2__item').text().match(/Lv\.([0-9,.]*)/)?.[1].replace(',', '') as string) || 0;
		const server = $('.profile-character-info__server').text().replace('@', '');
		const clan = $($('.game-info__guild').children()[1]).text();
		
		const basicTmp = $('.profile-ability-basic ul li span');
		const offense = parseInt($(basicTmp[1]).text());
		const life = parseInt($(basicTmp[3]).text());

		const battle: any[] = [];
		$('.profile-ability-battle ul > li').each((idx, elem) => {
			const child = $(elem).children('span');
			const text = $(child[0]).text();
			const value = parseInt($(child[1]).text());

			if ( text ) {
				battle.push({ text, value });
			}
		});

		const engrave: any[] = [];
		$('.profile-ability-engrave ul.swiper-slide li > span').each((idx, elem) => {
			const m = $(elem).text().match(/(.*)? Lv\. (\d+)/);
			if ( m ) {
				engrave.push({
					text: m[1],
					value: parseInt(m[2]),
				});
			}
		});

        const user: any = {
			engrave,
			battle,
			server,
			expLevel,
			level,
			name,
			clan,
			itemLevel,
			class: $('.profile-character-info__img').attr('alt') as string,
			offense,
			life,
		};

		{
			const t: any = res.body.match(/<script type="text\/javascript">[\s\S]*?= ([\s\S]*})?;/);
			if ( t ) {
				const profile: any = JSON.parse(t[1] as string);
				const equip = profile['Equip'];

                user.gems = parseGems(
                    Object.entries(equip)
                    .filter(([key]) => key.includes('Gem'))
                    .map(([key, val]) => val) as LarkGemElement[]
                );

                const ignoreGemsList: any[] = Object.entries(equip)
                    .filter(([key]) => /.*?(?<!Gem)_/.test(key))
                    .map(([key, val]) => val);

                const weaponElementList = ignoreGemsList.filter((val: any) => {
                    const element_008 = val?.Element_008?.value?.Element_000;
                    if ( typeof element_008 === 'string' ) {
                        if ( element_008.text() === '세트 효과 레벨' ) {
                            return true;
                        }
                    }

                    const element_009 = val?.Element_009?.value?.Element_000;
                    if ( typeof element_009 === 'string' ) {
                        if ( element_009.text() === '세트 효과 레벨' ) {
                            return true;
                        }
                    }

                    return false;
                });
                user.weapons = parseWeapon(weaponElementList);

                const accessoryElementList = ignoreGemsList.filter((val) => {
                    return val.Element_004?.value?.Element_000?.text() === '기본 효과' &&
                        val.Element_005?.value?.Element_000?.text() === '추가 효과';
                });
                user.accessories = parseAccessories(accessoryElementList);
			}
		}

		return user as LarkUser;
	}

}

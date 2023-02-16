/**
 * @file 选择日期的主体
 * @date 2023-02-09
 * @author xuejie.he
 * @lastModify xuejie.he 2023-02-09
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useRef, useState } from "react";
import { deepCloneData } from "./Components/Unit/deepCloneData";
import { comms, DataProps } from "./index";
import OptionItem from "./option";
import { initMenuData, initSelectData } from "./unit";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */

interface TempProps {
    list: Array<DataProps>;
}

/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
const Temp: React.FC<TempProps> = ({ list }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/

    /**
     * 非一级的menu
     */
    const [menuData, setMenuData] = useState(() => initMenuData());

    const menuDataRef = useRef<typeof menuData>(initMenuData());

    const [selectData, setSelectData] = useState(() => initSelectData());

    const selectDataRef = useRef<typeof selectData>(initSelectData());
    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    const changeMenuData = (data: typeof menuData) => {
        setMenuData(deepCloneData(data));
        menuDataRef.current = deepCloneData(data);
    };

    const changeSelectData = (data: typeof selectData) => {
        setSelectData(deepCloneData(data));
        selectDataRef.current = deepCloneData(data);
    };

    const onChange = (keyVal: string, changeData: DataProps) => {
        const options = comms.config.options ?? [];

        /**
         * 是否需要重置
         */
        let isRest = false;

        const _menuData = menuDataRef.current;
        const _selectData = selectDataRef.current;

        for (let i = 0; i < options.length; i++) {
            const item = options[i];

            if (item.code === keyVal) {
                _menuData[options[i + 1]?.code] = changeData.children ?? [];
                _selectData[item.code] = changeData.name;
                isRest = true;
            } else if (isRest) {
                _menuData[options[i + 1]?.code] = [];
                _selectData[item.code] = null;
            }
        }
        changeMenuData(_menuData);
        changeSelectData(_selectData);
    };

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */

    const options = comms.config.options ?? [];

    return (
        <>
            {options.map((option, index) => {
                let optionList: Array<DataProps> = [];

                if (index === 0) {
                    optionList = list;
                } else {
                    optionList = menuData[option.code] ?? [];
                }
                return (
                    <OptionItem
                        key={index}
                        disable={index === 0 ? false : !menuData?.[option.code]?.length}
                        name={option.content}
                        onChange={(res) => {
                            onChange(option.code, res);
                        }}
                        value={selectData[option.code] ?? undefined}
                        list={optionList}
                    />
                );
            })}
        </>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
export default Temp;

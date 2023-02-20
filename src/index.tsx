import React, { useMemo } from "react";
import "./font.scss";
import "./style.scss";

import { ConfigYML, PluginComms } from "@possie-engine/dr-plugin-sdk";
import Header from "./header";
import MainContent from "./main";
import { ScrollComponent } from "./Components/Scroll";

export const comms = new PluginComms({
    defaultConfig: new ConfigYML(),
}) as {
    config: {
        question?: string;
        instruction?: string;
        options?: Array<{ code: string; content: string }>;
        data?: string;
    };
    state: unknown;
    renderOnReady: (res: React.ReactNode) => void;
};

export interface DataProps {
    name: string;
    children?: Array<DataProps>;
}

const Main: React.FC = () => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const data = useMemo(() => {
        let json: Array<DataProps> = [];

        let isError = false;
        const checkData = (arr: Array<DataProps>) => {
            for (let i = 0; i < arr.length; ) {
                const item = arr[i];

                if (typeof item.name === "string") {
                    if (item.children?.length) {
                        checkData(item.children);
                    }
                    ++i;
                } else {
                    isError = true;
                    i = arr.length;
                }
            }
        };

        try {
            json = JSON.parse(comms.config?.data ?? `[]`) as Array<DataProps>;
            checkData(json);
        } catch (error) {
            isError = true;
        }
        if (isError) {
            console.error("数据格式不正确");
            return [];
        }
        return json;
    }, []);
    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/
    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <ScrollComponent className="wrapper">
            <Header />
            <MainContent list={data} />
        </ScrollComponent>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
document.documentElement.style.fontSize = "10px";
void comms.renderOnReady(<Main />);

import React from "react"
import { useState, useEffect } from "react"
import HeaderContainer from "../../../common/components/Header/HeaderContainer.jsx"
// import HeaderItem from "../../../common/components/Header/HeaderItem.jsx"
import HeaderItem from "../../../common/components/Header/HeaderItem.jsx"
import ActionButton from "../../../common/components/Button/ActionButton/ActionButton.jsx"
import styles from "./Dashboard.module.scss"
import ColumnChart from "../../../common/components/Chart/ColumnChart.jsx"
import PieDonutChart from "../../../common/components/Chart/PieDonutChart.jsx"
import {
    listTodayEnter,
    listMonthyEnter,
    listWeekyEnter,
    listTodayExport,
    listWeekyExport,
    listMonthyExport,
    listTodayCheck,
    listMonthyCheck,
    listWeekyCheck,
} from "../../../app/mockData/InventoryReceiptData.js"
// import { data } from "autoprefixer"
// import Chart from "react-apexcharts"
const Dashboard = () => {
    const [togleButtonPieChart, setTogleButtonPieChart] = useState([true, false, false])
    const [togleButtonColumnChart, setTogleButtonColumnChart] = useState([true, false, false])
    const [dataEnter, setDataEnter] = useState(listTodayEnter)
    const [filterDataEnter, setFilterDataEnter] = useState([])
    const [dataExport, setDataExport] = useState(listTodayExport)
    const [filterDataExport, setFilterDataExport] = useState([])
    const [dataCheck, setDataCheck] = useState(listTodayCheck)
    const [filterDataCheck, setFilterDataCheck] = useState([])
    // const [dataTotal, setDataTotal] = useState(listTodayCheck)
    const [filterDataTotal, setFilterDataTotal] = useState([])
    // console.log(styles.actionButton)
    useEffect(() => {
        setFilterDataEnter(() => {
            const value = [0, 0]
            dataEnter.forEach((item) => {
                if (item.status === "Hoàn thành") {
                    value[1]++
                } else {
                    value[0]++
                }
            })
            return value
        })
        setFilterDataExport(() => {
            const value = [0, 0]
            dataExport.forEach((item) => {
                if (item.status === "Hoàn thành") {
                    value[1]++
                } else {
                    value[0]++
                }
            })
            return value
        })
        setFilterDataCheck(() => {
            const value = [0, 0]
            dataCheck.forEach((item) => {
                if (item.status === "Hoàn thành") {
                    value[1]++
                } else {
                    value[0]++
                }
            })
            return value
        })
        setFilterDataTotal(() => {
            return [dataEnter.length, dataExport.length, dataCheck.length]
        })
    }, [dataEnter, dataExport, dataCheck])
    return (
        <div className="w-full h-full  flex flex-col gap-[2%]">
            <HeaderContainer style={{ height: "5%", padding: "0", margin: "0" }}>
                <HeaderItem>Tổng quan</HeaderItem>
            </HeaderContainer>
            <div className="w-full h-[5%] flex justify-end gap-[1%]  ">
                <ActionButton
                    className={`${styles.actionButton} ${styles.hoverEffect} `}
                    style={{
                        width: "10%",
                        height: "100%",
                        marginBottom: 0,
                        marginTop: 0,
                        marginLeft: 0,
                        marginRight: 0,
                        padding: 0,
                        fontSize: "12px",
                        backgroundColor: togleButtonPieChart[0] ? "#09306f" : "#4b5563",
                    }}
                    onClick={() => {
                        setDataEnter(listTodayEnter)
                        setDataExport(listTodayExport)
                        setDataCheck(listTodayCheck)
                        setTogleButtonPieChart([true, false, false])
                    }}
                >
                    Hôm nay
                </ActionButton>
                <ActionButton
                    className={`${styles.actionButton} ${styles.hoverEffect}`}
                    style={{
                        width: "10%",
                        height: "100%",
                        marginBottom: 0,
                        marginTop: 0,
                        marginLeft: 0,
                        marginRight: 0,
                        padding: 0,
                        // backgroundColor: "#4b5563",
                        fontSize: "12px",
                        backgroundColor: togleButtonPieChart[1] ? "#09306f" : "#4b5563",
                    }}
                    onClick={() => {
                        setDataEnter(listWeekyEnter)
                        setDataExport(listWeekyExport)
                        setDataCheck(listWeekyCheck)
                        setTogleButtonPieChart([false, true, false])
                    }}
                >
                    Tuần
                </ActionButton>
                <ActionButton
                    className={`${styles.actionButton} ${styles.hoverEffect}`}
                    style={{
                        width: "10%",
                        height: "100%",
                        marginBottom: 0,
                        marginTop: 0,
                        marginLeft: 0,
                        marginRight: 0,
                        padding: 0,
                        // backgroundColor: "#4b5563",
                        fontSize: "12px",
                        backgroundColor: togleButtonPieChart[2] ? "#09306f" : "#4b5563",
                    }}
                    onClick={() => {
                        setDataEnter(listMonthyEnter)
                        setDataExport(listMonthyExport)
                        setDataCheck(listMonthyCheck)
                        setTogleButtonPieChart([false, false, true])
                    }}
                >
                    Tháng
                </ActionButton>
            </div>
            <div className="w-full h-[40%] flex gap-[1%] justify-between">
                <div className=" h-full w-[23%] bg-[#f3f4f6] rounded-lg shadow-md justify-center items-center">
                    <HeaderContainer
                        style={{ height: "15%", justifyContent: "center", padding: "0", margin: "0", width: "100%" }}
                    >
                        <HeaderItem>Nhập kho</HeaderItem>
                    </HeaderContainer>
                    <div className="h-[20%] w-full flex justify-around">
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            <p className="font-bold">{`${dataEnter.length}`}</p>
                            <p>Tổng</p>
                        </div>
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            <p className="font-bold">{`${filterDataEnter[1]}`}</p>
                            <p>Hoàn thành</p>
                        </div>
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            <p className="font-bold">{`${((filterDataEnter[1] / dataEnter.length) * 100).toFixed(0)}%`}</p>
                            <p>Tỉ lệ</p>
                        </div>
                    </div>
                    <div className="h-[60%] w-[100%] ">
                        <PieDonutChart
                            height={"100%"}
                            width={"100%"}
                            name={""}
                            fontSize={"0.8rem"}
                            label={"Tổng"}
                            unit={"Lệnh sản xuất"}
                            dataChartLabels={["Chưa hoàn thành", "Hoàn thành"]}
                            dataChartValue={filterDataEnter}
                            // arrayColors={[
                            //     "rgba(233,34,34,0.85)",
                            //     "rgba(60,220,120,0.85)",
                            //     "rgba(250,175,36,0.85)",
                            //     "rgba(0,155,250,0.85)",
                            // ]}
                        />
                    </div>
                </div>
                <div className=" h-full w-[23%] bg-[#f3f4f6] rounded-lg shadow-md justify-center items-center">
                    <HeaderContainer
                        style={{ height: "15%", justifyContent: "center", padding: "0", margin: "0", width: "100%" }}
                    >
                        <HeaderItem>Xuất kho</HeaderItem>
                    </HeaderContainer>
                    <div className="h-[20%] w-full flex justify-around">
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            <p className="font-bold">{`${dataExport.length}`}</p>
                            <p>Tổng</p>
                        </div>
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            <p className="font-bold">{`${filterDataExport[1]}`}</p>
                            <p>Hoàn thành</p>
                        </div>
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            <p className="font-bold">{`${((filterDataExport[1] / dataExport.length) * 100).toFixed(0)}%`}</p>
                            <p>Tỉ lệ</p>
                        </div>
                    </div>
                    <div className="h-[60%] w-[100%] ">
                        <PieDonutChart
                            height={"100%"}
                            width={"100%"}
                            name={""}
                            fontSize={"0.8rem"}
                            label={"Tổng"}
                            unit={"Lệnh sản xuất"}
                            dataChartLabels={["Chưa hoàn thành", "Hoàn thành"]}
                            dataChartValue={filterDataExport}
                            // arrayColors={[
                            //     "rgba(233,34,34,0.85)",
                            //     "rgba(60,220,120,0.85)",
                            //     "rgba(250,175,36,0.85)",
                            //     "rgba(0,155,250,0.85)",
                            // ]}
                        />
                    </div>
                </div>
                <div className=" h-full w-[23%] bg-[#f3f4f6] rounded-lg shadow-md justify-center items-center">
                    <HeaderContainer
                        style={{ height: "15%", justifyContent: "center", padding: "0", margin: "0", width: "100%" }}
                    >
                        <HeaderItem>Kiểm kê</HeaderItem>
                    </HeaderContainer>
                    <div className="h-[20%] w-full flex justify-around">
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            <p className="font-bold">{`${dataCheck.length}`}</p>
                            <p>Tổng</p>
                        </div>
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            <p className="font-bold">{`${filterDataCheck[1]}`}</p>
                            <p>Định kỳ</p>
                        </div>
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            <p className="font-bold">{`${((filterDataCheck[1] / dataCheck.length) * 100).toFixed(0)}%`}</p>
                            <p>Tỉ lệ</p>
                        </div>
                    </div>
                    <div className="h-[60%] w-[100%] ">
                        <PieDonutChart
                            height={"100%"}
                            width={"100%"}
                            name={""}
                            fontSize={"0.8rem"}
                            label={"Tổng"}
                            unit={"Lệnh sản xuất"}
                            dataChartLabels={["Chưa hoàn thành", "Hoàn thành"]}
                            dataChartValue={filterDataCheck}
                            // arrayColors={[
                            //     "rgba(233,34,34,0.85)",
                            //     "rgba(60,220,120,0.85)",
                            //     "rgba(250,175,36,0.85)",
                            //     "rgba(0,155,250,0.85)",
                            // ]}
                        />
                    </div>
                </div>
                <div className=" h-full w-[23%] bg-[#f3f4f6] rounded-lg shadow-md justify-center items-center">
                    <HeaderContainer
                        style={{ height: "15%", justifyContent: "center", padding: "0", margin: "0", width: "100%" }}
                    >
                        <HeaderItem>Thống kê chung</HeaderItem>
                    </HeaderContainer>
                    <div className="h-[20%] w-full flex justify-around">
                        <div className="flex-col justify-around w-[24%] h-full items-center text-center">
                            <p className="font-bold">{`${filterDataTotal[0] + filterDataTotal[1] + filterDataTotal[2]}`}</p>
                            <p>Tổng</p>
                        </div>
                        <div className="flex-col justify-around w-[24%] h-full items-center text-center">
                            <p className="font-bold">{`${filterDataTotal[0]}`}</p>
                            <p>Nhập kho</p>
                        </div>
                        <div className="flex-col justify-around w-[24%] h-full items-center text-center">
                            <p className="font-bold">{`${filterDataTotal[1]}`}</p>
                            <p>Xuất kho</p>
                        </div>
                        <div className="flex-col justify-around w-[24%] h-full items-center text-center">
                            <p className="font-bold">{`${filterDataTotal[2]}`}</p>
                            <p>Kiểm kê</p>
                        </div>
                    </div>
                    <div className="h-[60%] w-[100%] ">
                        <PieDonutChart
                            height={"100%"}
                            width={"100%"}
                            name={""}
                            fontSize={"0.8rem"}
                            label={"Tổng"}
                            unit={"Lệnh sản xuất"}
                            dataChartLabels={["Nhập kho", "Xuất kho", "Kiểm kê"]}
                            dataChartValue={filterDataTotal}
                            // arrayColors={[
                            //     "rgba(233,34,34,0.85)",
                            //     "rgba(60,220,120,0.85)",
                            //     "rgba(250,175,36,0.85)",
                            //     "rgba(0,155,250,0.85)",
                            // ]}
                        />
                    </div>
                </div>
            </div>
            <div className="w-full h-[5%] flex justify-end gap-[1%]  ">
                <ActionButton
                    className={`${styles.actionButton} ${styles.hoverEffect}`}
                    style={{
                        width: "10%",
                        height: "100%",
                        marginBottom: 0,
                        marginTop: 0,
                        marginLeft: 0,
                        marginRight: 0,
                        padding: 0,
                        fontSize: "12px",
                        backgroundColor: togleButtonColumnChart[0] ? "#09306f" : "#4b5563",
                    }}
                    onClick={() => {
                        setTogleButtonColumnChart([true, false, false])
                    }}
                >
                    Hôm nay
                </ActionButton>
                <ActionButton
                    className={`${styles.actionButton} ${styles.hoverEffect}`}
                    style={{
                        width: "10%",
                        height: "100%",
                        marginBottom: 0,
                        marginTop: 0,
                        marginLeft: 0,
                        marginRight: 0,
                        padding: 0,
                        // backgroundColor: "#4b5563",
                        fontSize: "12px",
                        backgroundColor: togleButtonColumnChart[1] ? "#09306f" : "#4b5563",
                    }}
                    onClick={() => {
                        setTogleButtonColumnChart([false, true, false])
                    }}
                >
                    Tuần
                </ActionButton>
                <ActionButton
                    className={`${styles.actionButton} ${styles.hoverEffect}`}
                    style={{
                        width: "10%",
                        height: "100%",
                        marginBottom: 0,
                        marginTop: 0,
                        marginLeft: 0,
                        marginRight: 0,
                        padding: 0,
                        // backgroundColor: "#4b5563",
                        fontSize: "12px",
                        backgroundColor: togleButtonColumnChart[2] ? "#09306f" : "#4b5563",
                    }}
                    onClick={() => {
                        setTogleButtonColumnChart([false, false, true])
                    }}
                >
                    Tháng
                </ActionButton>
            </div>
            <div className="w-full h-[40%] flex justify-between">
                <div className=" h-full w-[48%] bg-[#f3f4f6] rounded-lg shadow-md justify-center items-center p-[0.7%]">
                    <p className="font-bold block h-[8%]">Thống kê xuất kho theo kho hàng</p>
                    <div className="h-[90%] w-full ">
                        <ColumnChart
                            height={"99%"}
                            width={"99%"}
                            name={"Sản lượng"}
                            fontSize={"0.5rem"}
                            // unit={
                            //     lineIdData.find((item) => {
                            //         return res.lineId === item.lineId
                            //     }).productUnit
                            // }
                            dataChartX={[
                                "Kho nguyên vật liệu",
                                "Kho vật tư",
                                "Kho bao bì",
                                "Kho bán thành phẩm",
                                " Kho thành phẩm",
                            ]}
                            dataChartValue={[4, 10, 15, 20, 12]}
                            colors={[
                                "rgba(1, 0, 140, 0.8)",
                                "rgba(80, 80, 255, 0.8)",
                                "rgba(60,220,120,0.85)",
                                "rgba(233,34,34,0.85)",
                            ]}
                        />
                    </div>
                </div>
                <div className=" h-full w-[48%] bg-[#f3f4f6] rounded-lg shadow-md justify-center items-center p-[0.7%]">
                    <p className="font-bold block h-[8%]">Thống kê nhập kho theo kho hàng</p>
                    <div className="h-[90%] w-full ">
                        <ColumnChart
                            height={"99%"}
                            width={"99%"}
                            name={"Sản lượng"}
                            fontSize={"0.5rem"}
                            // unit={
                            //     lineIdData.find((item) => {
                            //         return res.lineId === item.lineId
                            //     }).productUnit
                            // }
                            dataChartX={[
                                "Kho nguyên vật liệu",
                                "Kho vật tư",
                                "Kho bao bì",
                                "Kho bán thành phẩm",
                                " Kho thành phẩm",
                            ]}
                            dataChartValue={[4, 10, 15, 20, 12]}
                            colors={[
                                "rgba(1, 0, 140, 0.8)",
                                "rgba(80, 80, 255, 0.8)",
                                "rgba(60,220,120,0.85)",
                                "rgba(233,34,34,0.85)",
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard

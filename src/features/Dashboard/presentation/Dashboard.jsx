import React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import HeaderContainer from "../../../common/components/Header/HeaderContainer.jsx"
// import HeaderItem from "../../../common/components/Header/HeaderItem.jsx"
import HeaderItem from "../../../common/components/Header/HeaderItem.jsx"
import ActionButton from "../../../common/components/Button/ActionButton/ActionButton.jsx"
import styles from "./DashBoard.module.scss"
import PieDonutChart from "../../../common/components/Chart/PieDonutChart.jsx"
import overViewApi from "../../../api/overView.js"
import useOverviewRealtime from "../../../common/hooks/useOverviewRealtime.js"
import usePolling from "../../../common/hooks/usePolling.js"
import { useResolvedTheme } from "../../../common/hooks/useApplyTheme.js"
import { buildChartTheme, mergeChartOptions } from "../../../common/utils/chartTheme.js"
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
// ApexCharts được nạp động trong useEffect bên dưới (window.ApexCharts).

// Lấy dữ liệu tổng quan (getOverViewById) cho 1 mốc thời gian Today/ThisWeek/ThisMonth.
const fetchOverviewByType = async (type) => {
    try {
        return await overViewApi.getOverViewById(type)
    } catch (error) {
        console.error("Error fetching overview data:", error)
        return null
    }
}
// Lấy dữ liệu getInventoryActivityStats (thống kê theo kho) cho 1 mốc thời gian.
const fetchInventoryActivityStatsByType = async (type) => {
    try {
        return await overViewApi.getInventoryActivityStats(type)
    } catch (error) {
        console.error("Error fetching inventory activity stats:", error)
        return null
    }
}

// Nhãn + màu chấm trạng thái kết nối realtime hiển thị trên thanh tiêu đề.
const REALTIME_STATUS_META = {
    connected: { color: "var(--status-connected)", label: "Trực tiếp" },
    connecting: { color: "var(--status-connecting)", label: "Đang kết nối…" },
    reconnecting: { color: "var(--status-connecting)", label: "Đang kết nối lại…" },
    disconnected: { color: "var(--status-disconnected)", label: "Ngoại tuyến" },
}

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
    const [overviewData, setOverviewData] = useState({
        Today: null,
        ThisWeek: null,
        ThisMonth: null,
    })
    const [overviewType, setOverviewType] = useState("Today") // "Today", "ThisWeek", "ThisMonth"
    const [warehouseStats, setWarehouseStats] = useState({
        Today: null,
        ThisWeek: null,
        ThisMonth: null,
    })
    const [warehouseStatsType, setWarehouseStatsType] = useState("Today")
    const chartIssueRef = useRef(null);
    const chartReceiptRef = useRef(null);
    const resolvedTheme = useResolvedTheme();

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
    
    // Refs "gương" của state để các callback realtime/polling đọc được giá trị mới nhất mà không
    // cần đưa vào dependency (tránh dựng lại kết nối SignalR mỗi lần đổi tab).
    const overviewTypeRef = useRef(overviewType)
    const warehouseStatsTypeRef = useRef(warehouseStatsType)
    const overviewDataRef = useRef(overviewData)
    const warehouseStatsRef = useRef(warehouseStats)
    const lastRefetchAtRef = useRef(0)
    useEffect(() => { overviewTypeRef.current = overviewType }, [overviewType])
    useEffect(() => { warehouseStatsTypeRef.current = warehouseStatsType }, [warehouseStatsType])
    useEffect(() => { overviewDataRef.current = overviewData }, [overviewData])
    useEffect(() => { warehouseStatsRef.current = warehouseStats }, [warehouseStats])

    const [lastUpdatedAt, setLastUpdatedAt] = useState(null)

    /**
     * Nạp dữ liệu overview cho 1 mốc thời gian. Mặc định dùng cache; force=true bỏ qua cache
     * (dùng khi có tín hiệu realtime hoặc fallback polling).
     */
    const loadOverview = useCallback(async (type, { force = false } = {}) => {
        if (!force && overviewDataRef.current[type]) return
        const data = await fetchOverviewByType(type)
        setOverviewData((prev) => ({ ...prev, [type]: data }))
    }, [])

    /** Nạp dữ liệu thống kê theo kho cho 1 mốc thời gian. Xem loadOverview. */
    const loadWarehouseStats = useCallback(async (type, { force = false } = {}) => {
        if (!force && warehouseStatsRef.current[type]) return
        const data = await fetchInventoryActivityStatsByType(type)
        setWarehouseStats((prev) => ({ ...prev, [type]: data }))
    }, [])

    // Nạp overview theo overviewType nếu chưa có: chạy khi mount và khi bấm Tuần/Tháng lần đầu.
    useEffect(() => {
        loadOverview(overviewType)
    }, [overviewType, loadOverview])
    // Update displayed data when overviewType changes
    useEffect(() => {
        const data = overviewData[overviewType]
        if (data) {
            // Nhập kho
            setDataEnter(
                Array(data.receiptOverview?.totalReceipts || 0)
                    .fill({ status: "Hoàn thành" })
                    .map((item, idx) =>
                        idx < (data.receiptOverview?.completeReceipts || 0)
                            ? { ...item, status: "Hoàn thành" }
                            : { ...item, status: "Chưa hoàn thành" }
                    )
            )
            setFilterDataEnter([
                (data.receiptOverview?.totalReceipts || 0) - (data.receiptOverview?.completeReceipts || 0),
                data.receiptOverview?.completeReceipts || 0,
            ])
            // Xuất kho
            setDataExport(
                Array(data.issueOverview?.totalIssues || 0)
                    .fill({ status: "Hoàn thành" })
                    .map((item, idx) =>
                        idx < (data.issueOverview?.completeIssues || 0)
                            ? { ...item, status: "Hoàn thành" }
                            : { ...item, status: "Chưa hoàn thành" }
                    )
            )
            setFilterDataExport([
                (data.issueOverview?.totalIssues || 0) - (data.issueOverview?.completeIssues || 0),
                data.issueOverview?.completeIssues || 0,
            ])
            // Kiểm kê
            setDataCheck(
                Array(data.stockTakeOverview?.totalStockTakes || 0)
                    .fill({ status: "Định kỳ" })
                    .map((item, idx) =>
                        idx < (data.stockTakeOverview?.periodicStockTakes || 0)
                            ? { ...item, status: "Định kỳ" }
                            : { ...item, status: "Khác" }
                    )
            )
            setFilterDataCheck([
                (data.stockTakeOverview?.totalStockTakes || 0) - (data.stockTakeOverview?.periodicStockTakes || 0),
                data.stockTakeOverview?.periodicStockTakes || 0,
            ])
            // Thống kê chung
            setFilterDataTotal([
                data.totalOverview?.totalReceipts || 0,
                data.totalOverview?.totalIssues || 0,
                data.totalOverview?.totalStockTakes || 0,
            ])
        }
    }, [overviewType, overviewData])
    // Nạp warehouseStats theo warehouseStatsType nếu chưa có: khi mount và khi bấm Tuần/Tháng lần đầu.
    useEffect(() => {
        loadWarehouseStats(warehouseStatsType)
    }, [warehouseStatsType, loadWarehouseStats])

    // ── Realtime: nhận tín hiệu "overviewChanged" từ SignalR -> refetch mốc đang hiển thị ──────────
    const handleOverviewChanged = useCallback(() => {
        // Chặn dồn dập phía client (server đã debounce ~2s, đây là lớp phòng vệ thêm).
        const now = Date.now()
        if (now - lastRefetchAtRef.current < 1000) return
        lastRefetchAtRef.current = now

        const curOverview = overviewTypeRef.current
        const curWarehouse = warehouseStatsTypeRef.current
        loadOverview(curOverview, { force: true })
        loadWarehouseStats(curWarehouse, { force: true })
        // Các mốc thời gian không hiển thị -> đánh dấu stale để lần bấm tab sau tự nạp lại.
        setOverviewData((prev) => {
            const next = { ...prev }
            Object.keys(next).forEach((k) => { if (k !== curOverview) next[k] = null })
            return next
        })
        setWarehouseStats((prev) => {
            const next = { ...prev }
            Object.keys(next).forEach((k) => { if (k !== curWarehouse) next[k] = null })
            return next
        })
        setLastUpdatedAt(new Date())
    }, [loadOverview, loadWarehouseStats])

    const { status: realtimeStatus } = useOverviewRealtime({ onChange: handleOverviewChanged })

    // Fallback: khi realtime không ở trạng thái connected, tự poll lại mỗi 60s.
    usePolling(
        () => {
            loadOverview(overviewTypeRef.current, { force: true })
            loadWarehouseStats(warehouseStatsTypeRef.current, { force: true })
            setLastUpdatedAt(new Date())
        },
        60000,
        realtimeStatus !== "connected"
    )

    const realtimeMeta = REALTIME_STATUS_META[realtimeStatus] || REALTIME_STATUS_META.connecting
    // Hiển thị dữ liệu warehouseStats[warehouseStatsType] ra giao diện
    useEffect(() => {
        const stats = warehouseStats[warehouseStatsType]
        if (stats) {
            // Hiển thị dữ liệu ra console hoặc cập nhật state để render ra giao diện
            console.log("warehouseByReceipt:", stats.warehouseByReceipt)
            console.log("warehouseByIssue:", stats.warehouseByIssue)
            
        }
    }, [warehouseStats, warehouseStatsType])
    // Khi click ActionButton, cập nhật warehouseStatsType để ColumnChart hiển thị đúng dữ liệu API
    useEffect(() => {
        // Dynamically load ApexCharts if not already loaded
        if (!window.ApexCharts) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/apexcharts";
            script.onload = () => {
                renderCharts();
            };
            document.body.appendChild(script);
        } else {
            renderCharts();
        }

        function renderCharts() {
            // Thống kê xuất kho theo kho hàng
            if (chartIssueRef.current && window.ApexCharts) {
                if (chartIssueRef.current._apexChart) {
                    chartIssueRef.current._apexChart.destroy();
                }
                const stats = warehouseStats[warehouseStatsType]?.warehouseByIssue;
                const data = stats
                    ? [
                        Number(stats.finishedProductQuantity) || 0,
                        Number(stats.semiFinishedProductQuantity) || 0,
                        Number(stats.rawMaterialQuantity) || 0,
                        Number(stats.materialQuantity) || 0,
                        Number(stats.packagingQuantity) || 0,
                    ]
                    : [0, 0, 0, 0, 0];
                const options = {
                    chart: {
                        type: "bar",
                        height: "100%",
                        toolbar: { show: false },
                    },
                    title: {
                        text: "Thống kê xuất kho theo kho hàng",
                        align: "center",
                        style: { fontSize: "18px", fontWeight: "bold" }
                    },
                    plotOptions: {
                        bar: {
                            horizontal: false,
                            columnWidth: "35%", // giảm columnWidth để cột cao hơn
                            distributed: true,
                            endingShape: "flat", // giữ nguyên đầu cột
                        },
                    },
                    dataLabels: { enabled: false },
                    xaxis: {
                        categories: [
                            "Kho thành phẩm",
                            "Kho bán thành phẩm",
                            "Kho nguyên vật liệu",
                            "Kho vật tư",
                            "Kho bao bì",
                        ],
                        labels: {
                            style: {
                                fontSize: "10px"
                            }
                        }
                    },
                    yaxis: {
                        min: 0,
                        title: { text: "Sản lượng" },
                        labels: {
                            style: {
                                fontSize: "14px"
                            }
                        }
                    },
                    grid: {
                        padding: { left: 10, right: 10 }
                    },
                    colors: [
                        "rgba(1, 0, 140, 0.8)",
                        "rgba(80, 80, 255, 0.8)",
                        "rgba(60,220,120,0.85)",
                        "rgba(233,34,34,0.85)",
                        "rgba(250,175,36,0.85)",
                    ],
                    series: [
                        {
                            name: "Sản lượng",
                            data: data,
                        },
                    ],
                    legend: { show: false },
                };
                chartIssueRef.current._apexChart = new window.ApexCharts(
                    chartIssueRef.current,
                    mergeChartOptions(options, buildChartTheme(resolvedTheme))
                );
                chartIssueRef.current._apexChart.render();
            }
            // Thống kê nhập kho theo kho hàng
            if (chartReceiptRef.current && window.ApexCharts) {
                if (chartReceiptRef.current._apexChart) {
                    chartReceiptRef.current._apexChart.destroy();
                }
                const stats = warehouseStats[warehouseStatsType]?.warehouseByReceipt;
                const data = stats
                    ? [
                        Number(stats.finishedProductQuantity) || 0,
                        Number(stats.semiFinishedProductQuantity) || 0,
                        Number(stats.rawMaterialQuantity) || 0,
                        Number(stats.materialQuantity) || 0,
                        Number(stats.packagingQuantity) || 0,
                    ]
                    : [0, 0, 0, 0, 0];
                const options = {
                    chart: {
                        type: "bar",
                        height: "100%",
                        toolbar: { show: false },
                    },
                    title: {
                        text: "Thống kê nhập kho theo kho hàng",
                        align: "center",
                        style: { fontSize: "18px", fontWeight: "bold" }
                    },
                    plotOptions: {
                        bar: {
                            horizontal: false,
                            columnWidth: "35%", // giảm columnWidth để cột cao hơn
                            distributed: true,
                            endingShape: "flat", // giữ nguyên đầu cột
                        },
                    },
                    dataLabels: { enabled: false },
                    xaxis: {
                        categories: [
                            "Kho thành phẩm",
                            "Kho bán thành phẩm",
                            "Kho nguyên vật liệu",
                            "Kho vật tư",
                            "Kho bao bì",
                        ],
                        labels: {
                            style: {
                                fontSize: "10px"
                            }
                        }
                    },
                    yaxis: {
                        min: 0,
                        title: { text: "Sản lượng" },
                        labels: {
                            style: {
                                fontSize: "14px"
                            }
                        }
                    },
                    grid: {
                        padding: { left: 10, right: 10 }
                    },
                    colors: [
                        "rgba(1, 0, 140, 0.8)",
                        "rgba(80, 80, 255, 0.8)",
                        "rgba(60,220,120,0.85)",
                        "rgba(233,34,34,0.85)",
                        "rgba(250,175,36,0.85)",
                    ],
                    series: [
                        {
                            name: "Sản lượng",
                            data: data,
                        },
                    ],
                    legend: { show: false },
                };
                chartReceiptRef.current._apexChart = new window.ApexCharts(
                    chartReceiptRef.current,
                    mergeChartOptions(options, buildChartTheme(resolvedTheme))
                );
                chartReceiptRef.current._apexChart.render();
            }
        }
        // Cleanup
        return () => {
            if (chartIssueRef.current && chartIssueRef.current._apexChart) {
                chartIssueRef.current._apexChart.destroy();
            }
            if (chartReceiptRef.current && chartReceiptRef.current._apexChart) {
                chartReceiptRef.current._apexChart.destroy();
            }
        };
    }, [warehouseStats, warehouseStatsType, resolvedTheme]);

    return (
        <div
            className="w-full h-full flex flex-col gap-[2%]"
            style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "690px", // Điều chỉnh chiều cao phù hợp cho dashboard
                overflow: "hidden",
            }}
        >
            <HeaderContainer style={{ height: "5%", padding: "0", margin: "0" }}>
                <HeaderItem>Tổng quan</HeaderItem>
            </HeaderContainer>
            <div className="w-full h-[5%] flex justify-end items-center gap-[1%]  ">
                {/* Trạng thái kết nối realtime + thời điểm cập nhật gần nhất */}
                <div className="mr-auto flex items-center gap-[6px] text-[12px] text-gray-600">
                    <span className="inline-flex items-center gap-[4px]">
                        <span
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "9999px",
                                backgroundColor: realtimeMeta.color,
                                display: "inline-block",
                            }}
                        />
                        {realtimeMeta.label}
                    </span>
                    {lastUpdatedAt && (
                        <span>· Cập nhật {lastUpdatedAt.toLocaleTimeString("vi-VN")}</span>
                    )}
                </div>
                {/* ActionButton cho biểu đồ Pie (tổng quan) */}
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
                        backgroundColor: overviewType === "Today" ? "var(--btn-toggle-on)" : "var(--btn-toggle-off)",
                    }}
                    onClick={() => {
                        setOverviewType("Today")
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
                        fontSize: "12px",
                        backgroundColor: overviewType === "ThisWeek" ? "var(--btn-toggle-on)" : "var(--btn-toggle-off)",
                    }}
                    onClick={() => {
                        setOverviewType("ThisWeek")
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
                        fontSize: "12px",
                        backgroundColor: overviewType === "ThisMonth" ? "var(--btn-toggle-on)" : "var(--btn-toggle-off)",
                    }}
                    onClick={() => {
                        setOverviewType("ThisMonth")
                        setTogleButtonPieChart([false, false, true])
                    }}
                >
                    Tháng
                </ActionButton>
            </div>
            
            <div className="w-full h-[40%] flex gap-[1%] justify-between">
                <div className=" h-full w-[23%] bg-[var(--color-surface)] rounded-lg shadow-md justify-center items-center">
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
                            unit={""}
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
                <div className=" h-full w-[23%] bg-[var(--color-surface)] rounded-lg shadow-md justify-center items-center">
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
                            unit={""}
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
                <div className=" h-full w-[23%] bg-[var(--color-surface)] rounded-lg shadow-md justify-center items-center">
                    <HeaderContainer
                        style={{ height: "15%", justifyContent: "center", padding: "0", margin: "0", width: "100%" }}
                    >
                        <HeaderItem>Kiểm kê</HeaderItem>
                    </HeaderContainer>
                    <div className="h-[20%] w-full flex justify-around">
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            {/* Hiển thị tổng số kiểm kê từ stockTakeOverview.totalStockTakes */}
                            <p className="font-bold">{`${overviewData[overviewType]?.stockTakeOverview?.totalStockTakes || 0}`}</p>
                            <p>Tổng</p>
                        </div>
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            {/* Hiển thị số kiểm kê định kỳ từ stockTakeOverview.periodicStockTakes */}
                            <p className="font-bold">{`${overviewData[overviewType]?.stockTakeOverview?.periodicStockTakes || 0}`}</p>
                            <p>Định kỳ</p>
                        </div>
                        <div className="flex-col justify-around w-[30%] h-full items-center text-center">
                            {/* Tính toán tỷ lệ đúng */}
                            <p className="font-bold">
                                {(overviewData[overviewType]?.stockTakeOverview?.totalStockTakes || 0) > 0
                                    ? `${(
                                        (overviewData[overviewType]?.stockTakeOverview?.periodicStockTakes || 0) /
                                        (overviewData[overviewType]?.stockTakeOverview?.totalStockTakes || 1) *
                                        100
                                    ).toFixed(0)}%`
                                    : "0%"}
                            </p>
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
                            unit={""}
                            // Đảm bảo nhãn đúng với dữ liệu
                            dataChartLabels={["Khác", "Định kỳ"]}
                            dataChartValue={[
                                (overviewData[overviewType]?.stockTakeOverview?.totalStockTakes || 0) -
                                (overviewData[overviewType]?.stockTakeOverview?.periodicStockTakes || 0),
                                overviewData[overviewType]?.stockTakeOverview?.periodicStockTakes || 0,
                            ]}
                            // arrayColors={[
                            //     "rgba(233,34,34,0.85)",
                            //     "rgba(60,220,120,0.85)",
                            //     "rgba(250,175,36,0.85)",
                            //     "rgba(0,155,250,0.85)",
                            // ]}
                        />
                    </div>
                </div>
                <div className=" h-full w-[23%] bg-[var(--color-surface)] rounded-lg shadow-md justify-center items-center">
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
                            unit={""}
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
            {/* ActionButton riêng cho ColumnChart (thống kê kho hàng) */}
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
                        backgroundColor: togleButtonColumnChart[0] ? "var(--btn-toggle-on)" : "var(--btn-toggle-off)",
                    }}
                    onClick={() => {
                        setTogleButtonColumnChart([true, false, false])
                        setWarehouseStatsType("Today")
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
                        fontSize: "12px",
                        backgroundColor: togleButtonColumnChart[1] ? "var(--btn-toggle-on)" : "var(--btn-toggle-off)",
                    }}
                    onClick={() => {
                        setTogleButtonColumnChart([false, true, false])
                        setWarehouseStatsType("ThisWeek")
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
                        fontSize: "12px",
                        backgroundColor: togleButtonColumnChart[2] ? "var(--btn-toggle-on)" : "var(--btn-toggle-off)",
                    }}
                    onClick={() => {
                        setTogleButtonColumnChart([false, false, true])
                        setWarehouseStatsType("ThisMonth")
                    }}
                >
                    Tháng
                </ActionButton>
            </div>
            <div className="w-full h-[40%] flex justify-between">
                <div className=" h-full w-[48%] bg-[var(--color-surface)] rounded-lg shadow-md justify-center items-center p-[0.7%]">
                    
                    <div className="h-[100%] w-full ">
                        <div ref={chartIssueRef} style={{ width: "100%", height: "100%" }} />
                    </div>
                </div>
                <div className=" h-full w-[48%] bg-[var(--color-surface)] rounded-lg shadow-md justify-center items-center p-[0.7%]">
                    
                    <div className="h-[100%] w-full ">
                        <div ref={chartReceiptRef} style={{ width: "100%", height: "100%" }} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard

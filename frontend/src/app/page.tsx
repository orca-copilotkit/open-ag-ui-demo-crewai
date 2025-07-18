"use client"

import { CopilotChat, useCopilotChatSuggestions } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { useEffect, useState } from "react";
import { useCoAgentStateRender, useCopilotAction, useCopilotChat } from "@copilotkit/react-core";
import Table from "@/components/table";
import CustomBarChart from "@/components/bar-chart";
import { suggestions } from "@/utils/prompts";
import ToolLog from "@/components/tool-log";
import DotLoader from "@/components/dot-loader";
export default function Home() {
  const [tableData, setTableData] = useState<{ columns: string[], rows: { row_data: (string | number)[] }[], date: string }>({ columns: [], rows: [], date: "" });
  const [tableTopic, setTableTopic] = useState<string>("");
  const [barChartData, setBarChartData] = useState<{ date: string, data: { x: string, y: number }[] }>({ date: "", data: [] });
  const [barChartTopic, setBarChartTopic] = useState<string>("");
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const { visibleMessages, appendMessage } = useCopilotChat()

  useCopilotAction({
    name: "render_bar_chart",
    description: "Render a bar chart with the given data. The data would be very generic",
    parameters: [
      {
        name: "topic",
        description: "The topic of the bar chart that needs to be rendered",
        type: "string"
      },
      {
        name: "data",
        description: "The data of the bar chart that needs to be rendered",
        type: "object[]",
        attributes: [
          {
            name: "x",
            description: "The x-axis of the bar chart that needs to be rendered. if individual string is long, make a clipped word of it. For example, if the string is 'United States of America', make it 'USA', if the string is 'Amazon Inc', make it 'AMZ', if its a long number like 100000000000, make it 100B",
            type: "string"
          },
          {
            name: "y",
            description: "The y-axis of the bar chart that needs to be rendered. if individual string is long, make a clipped word of it. For example, if the string is 'United States of America', make it 'USA', if the string is 'Amazon Inc', make it 'AMZ', if its a long number like 100000000000, make it 100B",
            type: "number"
          }
        ]
      }
    ],
    renderAndWaitForResponse: ({ args, respond, status }) => {
      useEffect(() => {
        console.log(args, "barargs");
      }, [args])
      const [updated, setUpdated] = useState(false);
      return <>
        {/* @ts-ignore */}
        <CustomBarChart data={args?.data} barLabel={args?.topic} />
        <button hidden={updated} className="mt-2 mr-2 bg-indigo-500 text-white px-4 py-1 rounded-xl hover:bg-indigo-600 transition-all duration-300 cursor-pointer" onClick={() => {
          debugger
          respond?.("The Chart is approved")
          setUpdated(true)
          setBarChartData({ date: new Date().toLocaleTimeString(), data: args?.data || [] })
          setBarChartTopic(args?.topic || "")
        }}>
          Approve
        </button>
        <button hidden={updated} className="mt-2 bg-red-500 text-white px-4 py-1 rounded-xl hover:bg-red-600 transition-all duration-300 cursor-pointer" onClick={() => {
          respond?.("rejected")
          setUpdated(true)
        }}>
          Reject
        </button>
        {(status === "inProgress" || status === "executing") && <DotLoader />}
      </>
    }
  })
  useCopilotAction({
    name: "render_table",
    description: "Render a tabular data with the given data. The data would be very generic",
    parameters: [
      {
        name: "topic",
        description: "The topic of the table that needs to be rendered",
        type: "string"
      },
      {
        name: "columns",
        description: "The columns of the table that needs to be rendered",
        type: "string[]"
      },
      {
        name: "rows",
        description: "The rows of the table that needs to be rendered",
        type: "object[]",
        attributes: [
          {
            name: "row_data",
            description: "The data of the row that needs to be rendered",
            type: "string[]"
          }
        ]
      }
    ],
    renderAndWaitForResponse: ({ args, respond, status }) => {
      console.log(status, "tabsargs");
      const [updated, setUpdated] = useState(false);
      return <>
        {/* @ts-ignore */}
        <Table size="sm" columns={args?.columns} rows={args?.rows} />
        <button hidden={updated} className="mt-2 mr-2 bg-indigo-500 text-white px-4 py-1 rounded-xl hover:bg-indigo-600 transition-all duration-300 cursor-pointer" onClick={() => {
          debugger
          respond?.("accepted")
          setTableData({ columns: args?.columns || [], rows: args?.rows || [], date: new Date().toLocaleTimeString() })
          setUpdated(true)
          setTableTopic(args?.topic || "")
        }}>
          Approve
        </button>
        <button hidden={updated} className="mt-2 bg-red-500 text-white px-4 py-1 rounded-xl hover:bg-red-600 transition-all duration-300 cursor-pointer" onClick={() => {
          respond?.("rejected")
          setUpdated(true)
        }}>
          Reject
        </button>
        {(status === "inProgress" || status === "executing") && <DotLoader />}
      </>
    },
    // handler: (args) => {
    // console.log(args, "argsargs");
    // }
  })

  // useCoAgentStateRender({
  //   name: "langgraphAgent",
  //   render: ({ state, status, nodeName }) => {
  //     console.log(state, status, nodeName, "state");
  //     return (state.items.length > 0 ? <ToolLog state={state.items} /> : status === "inProgress" ? <DotLoader /> : <></>)
  //   }
  // })


  useCopilotChatSuggestions({
    instructions: suggestions,
    maxSuggestions: 3,
    minSuggestions: 2
  })


  useEffect(() => {
    console.log(visibleMessages, "visibleMessages");
  }, [visibleMessages])

  return (
    <div className="h-screen flex flex-col bg-indigo-50">
      {/* App Header - full width, topmost */}
      <header className="w-full bg-gradient-to-r from-[#FF003C] to-[#C8002A] py-3 px-8 flex items-center opacity-90">
        <h1 className="text-xl font-semibold text-gray-300 tracking-tight">AI Stock Analyst</h1>
      </header>
      <div className="flex-1 flex flex-col lg:flex-row" style={{ height: "90vh" }}>
        {/* Left Panel */}
        <div className="w-full lg:w-2/3 p-10 overflow-y-auto hide-scrollbar">
          <div className="flex flex-col gap-8 h-full">
            {(barChartTopic || tableTopic) ||
              ((barChartData.data.length > 0) && (tableData.rows.length > 0)) ? (
              <>
                {/* {Bar Chart data} */}
                {barChartTopic && <div className="bg-white rounded-xl shadow p-6 border-t-4 border-red-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-semibold text-black">{barChartTopic}</span>
                  </div>
                  <div className="text-xs text-gray-700 mb-4">Generated {barChartData.date}</div>
                  {barChartData.data.length > 0 && <CustomBarChart data={barChartData.data} xKey={"x"} barKey={"y"} barLabel={barChartTopic} />}
                </div>}

                {/* {Table data} */}
                {tableTopic && <div className="bg-white rounded-xl shadow p-6 border-t-4 border-red-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-semibold text-black">{tableTopic}</span>
                  </div>
                  <div className="text-xs text-gray-700 mb-4">Generated {tableData.date}</div>
                  {tableData.columns.length > 0 && tableData.rows.length > 0 && <Table size="lg" className="bg-white" columns={tableData.columns} rows={tableData.rows} />}
                </div>}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="mb-4 text-md font-semibold">No visualization to see. Click any of the suggestions below.</span>
                <ul className="space-y-2">
                  <li>
                    <button
                      disabled={isDisabled}
                      className="px-5 py-2 rounded-full bg-indigo-50 text-gray-500 text-sm font-medium shadow-sm hover:bg-indigo-100 transition border border-indigo-100"
                      onClick={() => {
                        appendMessage(new TextMessage({
                          content: "Get me the revenue data for Amazon Inc for the last 4 years and show it in a bar chart",
                          role: Role.User
                        }))
                        setIsDisabled(true)
                      }}
                    >
                      Show Amazon Revenue (Last 4 Years)
                    </button>
                  </li>
                  <li>
                    <button
                      disabled={isDisabled}
                      className="px-5 py-2 rounded-full bg-indigo-50 text-gray-500 text-sm font-medium shadow-sm hover:bg-indigo-100 transition border border-indigo-100"
                      onClick={() => {
                        appendMessage(new TextMessage({
                          content: "Get me the top 10 stock performers and show it in a table",
                          role: Role.User
                        }))
                        setIsDisabled(true)
                      }}
                    >
                      Show Top 10 Stock Performers
                    </button>
                  </li>
                  {/* Add more suggestions as needed */}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-1/3">
            <CopilotChat
              labels={{
                initial: "Hi, I am a stock agent. I can help you analyze and compare different stocks. Please ask me anything about the stock market.",
              }}
              className="h-full"
            />
        </div>
      </div>
    </div>
  );
}

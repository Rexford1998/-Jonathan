"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Plus, Calendar, CheckCircle2, Circle, ArrowLeft, Target, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DailyTask {
  id: string
  title: string
  description?: string
  completed: boolean
  date: string
  priority: "low" | "medium" | "high"
  longTermTaskId: string
}

interface MonthlyObjective {
  id: string
  title: string
  description?: string
  completed: boolean
  month: string // YYYY-MM format
  priority: "low" | "medium" | "high"
  longTermTaskId: string
}

interface LongTermTask {
  id: string
  title: string
  description?: string
  completed: boolean
  startDate: string
  dueDate: string
  priority: "low" | "medium" | "high"
}

type ViewMode = "timeline" | "detailed"

export default function TimelineTaskManager() {
  const [longTermTasks, setLongTermTasks] = useState<LongTermTask[]>([
    {
      id: "1",
      title: "Complete Master's Degree",
      description: "Finish all coursework and thesis to advance career",
      completed: false,
      startDate: "2024-01-01",
      dueDate: "2025-12-31",
      priority: "high",
    },
    {
      id: "2",
      title: "Learn Spanish Fluently",
      description: "Achieve conversational fluency for travel and career",
      completed: false,
      startDate: "2024-06-01",
      dueDate: "2026-06-01",
      priority: "medium",
    },
    {
      id: "3",
      title: "Build Dream House",
      description: "Design and construct family home with sustainable features",
      completed: false,
      startDate: "2025-01-01",
      dueDate: "2028-12-31",
      priority: "low",
    },
  ])

  const [monthlyObjectives, setMonthlyObjectives] = useState<MonthlyObjective[]>([
    {
      id: "mo-1",
      title: "Complete Semester 1 Courses",
      description: "Finish all required courses for first semester",
      completed: true,
      month: "2024-05",
      priority: "high",
      longTermTaskId: "1",
    },
    {
      id: "mo-2",
      title: "Start Spanish Basics",
      description: "Begin with basic vocabulary and grammar",
      completed: false,
      month: "2024-06",
      priority: "medium",
      longTermTaskId: "2",
    },
  ])

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    {
      id: "dt-1",
      title: "Submit Research Proposal",
      description: "Final submission of thesis research proposal",
      completed: true,
      date: "2024-03-15",
      priority: "high",
      longTermTaskId: "1",
    },
    {
      id: "dt-2",
      title: "Spanish Lesson 1",
      description: "Complete first online Spanish lesson",
      completed: false,
      date: "2024-06-01",
      priority: "medium",
      longTermTaskId: "2",
    },
  ])

  const [viewMode, setViewMode] = useState<ViewMode>("timeline")
  const [selectedLongTermTask, setSelectedLongTermTask] = useState<LongTermTask | null>(null)
  const [newTaskDialog, setNewTaskDialog] = useState(false)
  const [newObjectiveDialog, setNewObjectiveDialog] = useState(false)
  const [newDailyTaskDialog, setNewDailyTaskDialog] = useState(false)

  const today = new Date()
  const thirtyYearsFromNow = new Date(today.getFullYear() + 30, today.getMonth(), today.getDate())

  // Calculate timeline positions for main view (30 years, 3-year intervals)
  const mainTimelineData = useMemo(() => {
    const totalDays = Math.ceil((thirtyYearsFromNow.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    const getPositionPercent = (date: string | Date) => {
      const targetDate = typeof date === "string" ? new Date(date) : date
      const daysFromToday = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return Math.max(0, Math.min(100, (daysFromToday / totalDays) * 100))
    }

    return { totalDays, getPositionPercent }
  }, [today, thirtyYearsFromNow])

  // Calculate timeline positions for detailed view (selected task timeframe)
  const detailedTimelineData = useMemo(() => {
    if (!selectedLongTermTask) return null

    const startDate = new Date(selectedLongTermTask.startDate)
    const endDate = new Date(selectedLongTermTask.dueDate)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const getPositionPercent = (date: string | Date) => {
      const targetDate = typeof date === "string" ? new Date(date) : date
      const daysFromStart = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      return Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100))
    }

    return { startDate, endDate, totalDays, getPositionPercent }
  }, [selectedLongTermTask])

  const addLongTermTask = (task: Omit<LongTermTask, "id">) => {
    const newTask: LongTermTask = {
      ...task,
      id: Date.now().toString(),
    }
    setLongTermTasks([...longTermTasks, newTask])
    setNewTaskDialog(false)
  }

  const addMonthlyObjective = (objective: Omit<MonthlyObjective, "id" | "longTermTaskId">) => {
    if (!selectedLongTermTask) return
    const newObjective: MonthlyObjective = {
      ...objective,
      id: `mo-${Date.now()}`,
      longTermTaskId: selectedLongTermTask.id,
    }
    setMonthlyObjectives([...monthlyObjectives, newObjective])
    setNewObjectiveDialog(false)
  }

  const addDailyTask = (task: Omit<DailyTask, "id" | "longTermTaskId">) => {
    if (!selectedLongTermTask) return
    const newTask: DailyTask = {
      ...task,
      id: `dt-${Date.now()}`,
      longTermTaskId: selectedLongTermTask.id,
    }
    setDailyTasks([...dailyTasks, newTask])
    setNewDailyTaskDialog(false)
  }

  const toggleLongTermTaskCompletion = (taskId: string) => {
    setLongTermTasks((tasks) =>
      tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    )
  }

  const toggleMonthlyObjectiveCompletion = (objectiveId: string) => {
    setMonthlyObjectives((objectives) =>
      objectives.map((obj) => (obj.id === objectiveId ? { ...obj, completed: !obj.completed } : obj)),
    )
  }

  const toggleDailyTaskCompletion = (taskId: string) => {
    setDailyTasks((tasks) => tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 border-green-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split("-")
    return new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  const getThreeYearMarkers = () => {
    const markers = []
    const currentYear = today.getFullYear()
    for (let i = 0; i <= 10; i++) {
      const year = currentYear + i * 3
      const yearDate = new Date(year, 0, 1)
      const position = mainTimelineData.getPositionPercent(yearDate)
      markers.push({ year, position })
    }
    return markers
  }

  const getMonthlyMarkers = () => {
    if (!detailedTimelineData) return []
    const markers = []
    const startDate = detailedTimelineData.startDate
    const endDate = detailedTimelineData.endDate

    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    while (currentDate <= endDate) {
      const position = detailedTimelineData.getPositionPercent(currentDate)
      markers.push({
        date: new Date(currentDate),
        position,
        monthKey: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`,
      })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    return markers
  }

  const getTasksForMonth = (monthKey: string) => {
    const objectives = monthlyObjectives.filter((obj) => obj.month === monthKey)
    const tasks = dailyTasks.filter((task) => task.date.startsWith(monthKey))
    return { objectives, tasks }
  }

  const getTasksForDate = (date: string) => {
    return dailyTasks.filter((task) => task.date === date)
  }

  if (viewMode === "detailed" && selectedLongTermTask && detailedTimelineData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setViewMode("timeline")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Timeline
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedLongTermTask.title}</h1>
                <p className="text-gray-600">{selectedLongTermTask.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(selectedLongTermTask.startDate)} → {formatDate(selectedLongTermTask.dueDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={newObjectiveDialog} onOpenChange={setNewObjectiveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Monthly Objective
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Monthly Objective</DialogTitle>
                  </DialogHeader>
                  <MonthlyObjectiveForm onSubmit={addMonthlyObjective} />
                </DialogContent>
              </Dialog>
              <Dialog open={newDailyTaskDialog} onOpenChange={setNewDailyTaskDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Daily Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Daily Task</DialogTitle>
                  </DialogHeader>
                  <DailyTaskForm onSubmit={addDailyTask} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Detailed Timeline */}
        <div className="p-4">
          <div className="relative bg-white rounded-lg border border-gray-200 overflow-x-auto">
            {/* Timeline Base */}
            <div className="relative h-24 border-b border-gray-300">
              {/* Monthly Markers */}
              {getMonthlyMarkers().map(({ date, position, monthKey }) => (
                <div
                  key={monthKey}
                  className="absolute top-0 bottom-0 border-l border-gray-200"
                  style={{ left: `${position}%` }}
                >
                  <div className="absolute -top-6 left-1 text-xs text-gray-500 font-medium">
                    {date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                  </div>
                </div>
              ))}

              {/* Start and End Markers */}
              <div className="absolute top-0 bottom-0 border-l-2 border-green-500" style={{ left: "0%" }}>
                <div className="absolute -top-6 left-1 text-xs text-green-600 font-bold bg-green-100 px-1 rounded">
                  START
                </div>
              </div>
              <div className="absolute top-0 bottom-0 border-l-2 border-red-500" style={{ left: "100%" }}>
                <div className="absolute -top-6 right-1 text-xs text-red-600 font-bold bg-red-100 px-1 rounded">
                  GOAL
                </div>
              </div>

              {/* Timeline Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-red-500"></div>
            </div>

            {/* Tasks and Objectives */}
            <div className="relative min-h-96 p-4">
              <Tabs defaultValue="monthly" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="monthly">Monthly View</TabsTrigger>
                  <TabsTrigger value="daily">Daily View</TabsTrigger>
                </TabsList>

                <TabsContent value="monthly">
                  <div className="space-y-4">
                    {getMonthlyMarkers().map(({ monthKey, position }) => {
                      const { objectives, tasks } = getTasksForMonth(monthKey)
                      if (objectives.length === 0 && tasks.length === 0) return null

                      return (
                        <div key={monthKey} className="relative">
                          <div
                            className="absolute w-80"
                            style={{
                              left: `${Math.min(position, 75)}%`,
                            }}
                          >
                            <Card className="border-2 border-blue-200">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{formatMonth(monthKey)}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {objectives.map((objective) => (
                                  <div
                                    key={objective.id}
                                    className="flex items-start gap-2 mb-2 p-2 bg-blue-50 rounded"
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleMonthlyObjectiveCompletion(objective.id)}
                                    >
                                      {objective.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-gray-400" />
                                      )}
                                    </Button>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`text-sm font-medium ${objective.completed ? "line-through text-gray-500" : ""}`}
                                        >
                                          {objective.title}
                                        </span>
                                        <Badge className={getPriorityColor(objective.priority)}>
                                          {objective.priority}
                                        </Badge>
                                      </div>
                                      {objective.description && (
                                        <p className="text-xs text-gray-600 mt-1">{objective.description}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {tasks.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">{tasks.length} daily tasks this month</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="daily">
                  <div className="space-y-4">
                    {dailyTasks
                      .filter((task) => task.longTermTaskId === selectedLongTermTask.id)
                      .map((task) => {
                        const position = detailedTimelineData.getPositionPercent(task.date)
                        const allTasksOnDate = getTasksForDate(task.date)

                        return (
                          <div key={task.id} className="relative">
                            <div
                              className="absolute w-72"
                              style={{
                                left: `${Math.min(position, 75)}%`,
                              }}
                            >
                              <Card className={`border-2 ${getPriorityColor(task.priority)}`}>
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleDailyTaskCompletion(task.id)}
                                    >
                                      {task.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-gray-400" />
                                      )}
                                    </Button>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span
                                          className={`text-sm font-medium ${task.completed ? "line-through text-gray-500" : ""}`}
                                        >
                                          {task.title}
                                        </span>
                                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                          {task.priority}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-gray-600 mb-1">{formatDate(task.date)}</p>
                                      {task.description && <p className="text-xs text-gray-600">{task.description}</p>}
                                      {allTasksOnDate.length > 1 && (
                                        <p className="text-xs text-orange-600 mt-1">
                                          {allTasksOnDate.length} tasks on this date
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Timeline View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Long-term Goals Timeline</h1>
            <p className="text-gray-600 mt-2">30-year vision • Click any goal to dive deeper</p>
          </div>
          <Dialog open={newTaskDialog} onOpenChange={setNewTaskDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Long-term Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Long-term Goal</DialogTitle>
              </DialogHeader>
              <LongTermTaskForm onSubmit={addLongTermTask} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="p-4">
        <div className="relative bg-white rounded-lg border border-gray-200 overflow-x-auto">
          {/* Timeline Base */}
          <div className="relative h-32 border-b border-gray-300">
            {/* 3-Year Markers */}
            {getThreeYearMarkers().map(({ year, position }) => (
              <div
                key={year}
                className="absolute top-0 bottom-0 border-l border-gray-200"
                style={{ left: `${position}%` }}
              >
                <div className="absolute -top-6 left-1 text-xs text-gray-500 font-medium">{year}</div>
              </div>
            ))}

            {/* Today Marker */}
            <div className="absolute top-0 bottom-0 border-l-2 border-blue-500 z-10" style={{ left: "0%" }}>
              <div className="absolute -top-6 left-1 text-xs text-blue-600 font-bold bg-blue-100 px-1 rounded">
                TODAY
              </div>
            </div>

            {/* 30 Years Marker */}
            <div className="absolute top-0 bottom-0 border-l-2 border-gray-800" style={{ left: "100%" }}>
              <div className="absolute -top-6 right-1 text-xs text-gray-800 font-bold bg-gray-100 px-1 rounded">
                30 YEARS
              </div>
            </div>

            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-gray-800 rounded"></div>
          </div>

          {/* Long-term Tasks */}
          <div className="relative min-h-96 p-4">
            {longTermTasks.map((task, taskIndex) => {
              const taskPosition = mainTimelineData.getPositionPercent(task.dueDate)

              return (
                <div key={task.id} className="relative mb-8">
                  {/* Task Card */}
                  <div
                    className="absolute w-80 cursor-pointer"
                    style={{
                      left: `${Math.min(taskPosition, 75)}%`,
                      top: `${taskIndex * 140}px`,
                    }}
                    onClick={() => {
                      setSelectedLongTermTask(task)
                      setViewMode("detailed")
                    }}
                  >
                    <Card className={`border-2 ${getPriorityColor(task.priority)} hover:shadow-lg transition-shadow`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleLongTermTaskCompletion(task.id)
                              }}
                              className="mt-1"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </Button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className={`text-lg ${task.completed ? "line-through text-gray-500" : ""}`}>
                                  {task.title}
                                </CardTitle>
                                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Due: {formatDate(task.dueDate)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Target className="w-4 h-4" />
                                  {monthlyObjectives.filter((obj) => obj.longTermTaskId === task.id).length} objectives
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {dailyTasks.filter((dt) => dt.longTermTaskId === task.id).length} tasks
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Connection Line to Timeline */}
                  <div
                    className="absolute w-0.5 bg-gray-400"
                    style={{
                      left: `${Math.min(taskPosition, 75) + 10}%`,
                      top: `${taskIndex * 140 - 20}px`,
                      height: "20px",
                    }}
                  ></div>

                  {/* Due Date Label */}
                  <div
                    className="absolute text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded border shadow-sm"
                    style={{
                      left: `${Math.min(taskPosition, 75) + 5}%`,
                      top: `${taskIndex * 140 - 35}px`,
                    }}
                  >
                    {formatDate(task.dueDate)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                  <span>High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span>Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Low Priority</span>
                </div>
              </div>
              <div className="text-gray-500">Click any goal to see monthly objectives and daily tasks</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LongTermTaskForm({ onSubmit }: { onSubmit: (task: Omit<LongTermTask, "id">) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
    completed: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim() && formData.dueDate) {
      onSubmit(formData)
      setFormData({
        title: "",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        priority: "medium",
        completed: false,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Goal Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter your long-term goal"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what achieving this goal means to you"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Target Date</label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <Select
          value={formData.priority}
          onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        Create Long-term Goal
      </Button>
    </form>
  )
}

function MonthlyObjectiveForm({
  onSubmit,
}: { onSubmit: (objective: Omit<MonthlyObjective, "id" | "longTermTaskId">) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    month: "",
    priority: "medium" as "low" | "medium" | "high",
    completed: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim() && formData.month) {
      onSubmit(formData)
      setFormData({
        title: "",
        description: "",
        month: "",
        priority: "medium",
        completed: false,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Objective Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter monthly objective"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what you want to accomplish this month"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Target Month</label>
          <Input
            type="month"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <Select
            value={formData.priority}
            onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full">
        Add Monthly Objective
      </Button>
    </form>
  )
}

function DailyTaskForm({ onSubmit }: { onSubmit: (task: Omit<DailyTask, "id" | "longTermTaskId">) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    priority: "medium" as "low" | "medium" | "high",
    completed: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim() && formData.date) {
      onSubmit(formData)
      setFormData({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        priority: "medium",
        completed: false,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Task Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter daily task"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the specific task"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <Select
            value={formData.priority}
            onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full">
        Add Daily Task
      </Button>
    </form>
  )
}

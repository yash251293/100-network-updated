"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  Plus,
  Download,
  ArrowLeft,
  Check,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  ExternalLink,
  Receipt,
  AlertCircle,
  User,
  Clock,
  FileText
} from "lucide-react"
import Link from "next/link"

export default function BillingPage() {
  const paymentMethods = [
    {
      id: 1,
      type: "Visa",
      lastFour: "4242",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 2,
      type: "Mastercard",
      lastFour: "5555",
      expiryMonth: 8,
      expiryYear: 2024,
      isDefault: false
    }
  ]

  const hiringPayments = [
    {
      id: 1,
      date: "2024-01-15",
      freelancer: "Sarah Johnson",
      project: "Website Redesign",
      amount: 2500.00,
      status: "completed",
      paymentType: "Project Payment",
      duration: "2 weeks"
    },
    {
      id: 2,
      date: "2024-01-10",
      freelancer: "Michael Chen",
      project: "Mobile App Development",
      amount: 4200.00,
      status: "completed",
      paymentType: "Milestone Payment (3/3)",
      duration: "1 month"
    },
    {
      id: 3,
      date: "2024-01-05",
      freelancer: "Emily Rodriguez",
      project: "Logo Design & Branding",
      amount: 850.00,
      status: "completed",
      paymentType: "Project Payment",
      duration: "1 week"
    },
    {
      id: 4,
      date: "2023-12-28",
      freelancer: "David Kim",
      project: "Backend API Development",
      amount: 3200.00,
      status: "completed",
      paymentType: "Milestone Payment (2/2)",
      duration: "3 weeks"
    },
    {
      id: 5,
      date: "2023-12-20",
      freelancer: "Lisa Wang",
      project: "Content Writing",
      amount: 650.00,
      status: "completed",
      paymentType: "Hourly Payment",
      duration: "5 days"
    },
    {
      id: 6,
      date: "2023-12-15",
      freelancer: "Alex Thompson",
      project: "Social Media Campaign",
      amount: 1200.00,
      status: "pending",
      paymentType: "Project Payment",
      duration: "2 weeks"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const totalSpent = hiringPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const completedPayments = hiringPayments.filter(p => p.status === "completed").length
  const pendingPayments = hiringPayments.filter(p => p.status === "pending").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="w-[65%] mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="p-2 hover:bg-slate-100 rounded-xl">
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-primary-navy">Billing & Payments</h1>
                <p className="text-lg text-slate-600 font-semibold">
                  Manage your payment methods and view hiring transaction history
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-navy">${totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-slate-600 font-semibold">Total Spent on Hiring</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-navy">{completedPayments}</p>
                  <p className="text-sm text-slate-600 font-semibold">Completed Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-navy">{pendingPayments}</p>
                  <p className="text-sm text-slate-600 font-semibold">Pending Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-2 space-y-8">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-primary-navy">Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods for hiring freelancers</CardDescription>
                  </div>
                  <Button size="sm" className="bg-primary-navy hover:bg-primary-navy/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">
                            {method.type} •••• {method.lastFour}
                          </span>
                          {method.isDefault && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Hiring Payment History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-primary-navy">Hiring Payment History</CardTitle>
                    <CardDescription>Complete record of payments made to freelancers</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {hiringPayments.map((payment) => (
                  <div key={payment.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{payment.freelancer}</h4>
                          <p className="text-sm text-slate-600">{payment.project}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-navy">${payment.amount.toLocaleString()}</p>
                        <Badge className={`${getStatusColor(payment.status)} text-xs font-semibold`}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(payment.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {payment.duration}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{payment.paymentType}</span>
                        <Button variant="ghost" size="sm" className="p-1">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions and Summary */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-primary-navy">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-3" />
                  Download Receipt
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Receipt className="h-4 w-4 mr-3" />
                  View All Invoices
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-3" />
                  Tax Documents
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-3" />
                  Payment Support
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-primary-navy">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hiringPayments.slice(0, 4).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900">{payment.freelancer}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900">${payment.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* This Month Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-primary-navy">This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Freelancers Hired</span>
                  <span className="font-semibold">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Projects Completed</span>
                  <span className="font-semibold">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Average Project Value</span>
                  <span className="font-semibold">$1,875</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Spent</span>
                  <span className="font-semibold text-primary-navy">${hiringPayments.slice(0, 3).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
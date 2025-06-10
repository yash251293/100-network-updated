"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, MapPin, Users, Building2, Star, TrendingUp, Award, ArrowLeft, Heart, HeartOff, Eye, Bookmark, Calendar, Globe } from "lucide-react"
import Link from "next/link"

const starredCompanies = [
  {
    id: 1,
    name: "100Networks",
    industry: "Internet & Software",
    followers: "2.08M",
    location: "San Francisco, CA",
    employees: "250 - 1,000",
    type: "Private",
    logo: null,
    logoFallback: "1N",
    isFollowing: true,
    isVerified: true,
    description: "Professional networking platform following talent with opportunities",
    openJobs: 47,
    rating: 4.8,
    starredDate: "2024-01-15"
  },
  {
    id: 2,
    name: "Google",
    industry: "Internet & Software",
    followers: "71.6K",
    location: "Mountain View, CA",
    employees: "25,000+",
    type: "Public",
    logo: "/placeholder.svg?height=48&width=48&query=google logo",
    isFollowing: false,
    isVerified: true,
    description: "Organizing the world's information and making it universally accessible",
    openJobs: 156,
    rating: 4.5,
    starredDate: "2024-01-20"
  },
  {
    id: 3,
    name: "Microsoft",
    industry: "Internet & Software",
    followers: "89.3K",
    location: "Redmond, WA",
    employees: "25,000+",
    type: "Public",
    logo: "/placeholder.svg?height=48&width=48&query=microsoft logo",
    isFollowing: false,
    isVerified: true,
    description: "Empowering every person and organization on the planet to achieve more",
    openJobs: 198,
    rating: 4.4,
    starredDate: "2024-02-01"
  },
  {
    id: 4,
    name: "FactSet",
    industry: "Financial Services",
    followers: "5.35K",
    location: "Norwalk, CT",
    employees: "10,000 - 25,000",
    type: "Public",
    logo: "/placeholder.svg?height=48&width=48&query=factset logo",
    isFollowing: false,
    isVerified: true,
    description: "Financial data and software solutions for investment professionals",
    openJobs: 32,
    rating: 4.1,
    starredDate: "2024-02-10"
  }
]

export default function StarredCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recently-starred")

  const filteredCompanies = starredCompanies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUnstar = (companyId: number) => {
    // Handle unstarring logic here
    console.log(`Unstarred company ${companyId}`)
  }

  return (
    <div className="max-w-6xl mx-auto py-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/employers">
            <Button variant="ghost" size="sm" className="mr-4 text-slate-600 hover:text-primary-navy">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
          </Link>
        </div>
        <div className="flex items-center mb-2">
          <Heart className="h-8 w-8 mr-3 text-red-500" />
          <h1 className="text-3xl font-heading text-primary-navy">Starred Companies</h1>
        </div>
        <p className="text-slate-600 font-subheading text-lg">Companies you've bookmarked for future reference</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-subheading text-slate-500">Total Starred</p>
                <p className="text-2xl font-heading text-primary-navy">{starredCompanies.length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-subheading text-slate-500">Also Following</p>
                <p className="text-2xl font-heading text-blue-600">{starredCompanies.filter(c => c.isFollowing).length}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-subheading text-slate-500">Open Positions</p>
                <p className="text-2xl font-heading text-green-600">{starredCompanies.reduce((sum, c) => sum + c.openJobs, 0)}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-subheading text-slate-500">Avg Rating</p>
                <p className="text-2xl font-heading text-orange-600">
                  {(starredCompanies.reduce((sum, c) => sum + c.rating, 0) / starredCompanies.length).toFixed(1)}
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200 shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search starred companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-slate-200 focus:border-primary-navy focus:ring-primary-navy/10 font-subheading rounded-xl"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] h-12 border-slate-200 focus:border-primary-navy rounded-xl font-subheading">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="recently-starred" className="font-subheading">Recently Starred</SelectItem>
                <SelectItem value="name" className="font-subheading">Company Name</SelectItem>
                <SelectItem value="rating" className="font-subheading">Highest Rated</SelectItem>
                <SelectItem value="jobs" className="font-subheading">Most Jobs</SelectItem>
                <SelectItem value="followers" className="font-subheading">Most Followers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      <div className="space-y-4">
        {filteredCompanies.length === 0 ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-heading text-slate-600 mb-2">No starred companies found</h3>
              <p className="text-slate-500 font-subheading mb-6">
                {searchQuery ? "Try adjusting your search terms" : "Start exploring companies and star the ones you're interested in"}
              </p>
              <Link href="/employers">
                <Button className="bg-primary-navy hover:bg-primary-navy/90 text-white rounded-lg font-subheading">
                  Browse Companies
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredCompanies.map((company) => (
            <Card key={company.id} className="border-slate-200 hover:shadow-lg hover:border-primary-navy/30 transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        {company.logo ? (
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                            <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-navy to-[#0056B3] flex items-center justify-center text-white font-heading text-lg">
                            {company.logoFallback}
                          </div>
                        )}
                        {company.isVerified && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Award className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h2 className="text-xl font-heading text-primary-navy group-hover:text-primary-navy transition-colors">
                            {company.name}
                          </h2>
                          {company.isVerified && (
                            <Badge className="bg-green-50 text-green-700 border-green-200 font-subheading text-xs">
                              Verified
                            </Badge>
                          )}
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        </div>
                        <p className="text-slate-600 font-subheading leading-relaxed mb-3">
                          {company.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4" />
                            <span className="font-subheading">{company.industry}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span className="font-subheading">{company.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span className="font-subheading">{company.employees}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-subheading">Starred {new Date(company.starredDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-1 text-slate-500">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-subheading text-sm">{company.followers} followers</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-subheading text-sm text-slate-600">{company.rating}</span>
                        </div>
                        <Badge className="bg-slate-100 text-slate-700 font-subheading">
                          {company.type}
                        </Badge>
                        <span className="text-sm text-slate-500 font-subheading">
                          {company.openJobs} open positions
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200 hover:border-primary-navy hover:text-primary-navy rounded-lg font-subheading"
                        >
                          View Jobs
                        </Button>
                        <Button
                          variant={company.isFollowing ? "outline" : "default"}
                          size="sm"
                          className={company.isFollowing
                            ? "border-slate-200 hover:border-red-300 hover:text-red-600 rounded-lg font-subheading"
                            : "bg-primary-navy hover:bg-primary-navy/90 text-white rounded-lg font-subheading"
                          }
                        >
                          {company.isFollowing ? "Following" : "Follow"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnstar(company.id)}
                          className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 rounded-lg font-subheading"
                        >
                          <HeartOff className="h-4 w-4 mr-1" />
                          Unstar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 text-center">
        <div className="flex justify-center space-x-4">
          <Link href="/employers">
            <Button
              variant="outline"
              size="lg"
              className="border-slate-200 hover:border-primary-navy hover:text-primary-navy rounded-xl font-subheading px-8"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Find More Companies
            </Button>
          </Link>
          <Link href="/companies/following">
            <Button
              variant="outline"
              size="lg"
              className="border-slate-200 hover:border-primary-navy hover:text-primary-navy rounded-xl font-subheading px-8"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Following
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
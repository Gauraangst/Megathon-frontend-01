'use client'

import Link from "next/link"
import React, { useState, useEffect } from "react"
import { Shield, Brain, Eye, TrendingUp, CheckCircle, Users, Ship, Building, Music, Flame, Trophy, Zap, Star, Globe, Diamond, Skull } from "lucide-react"
import ClaimantImageAnalysis from '@/components/ClaimantImageAnalysis'
import FloatingDebugButton from '@/components/FloatingDebugButton'
import Logo from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, userProfile } = useAuth()
  const [currentFact, setCurrentFact] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const chubbFacts = [
    {
      icon: Ship,
      title: "Titanic Insurance",
      description: "Chubb insured the Titanic's owner, the White Star Line for both the Titanic and its sister ship, the RMS Olympic",
      color: "text-blue-600"
    },
    {
      icon: Diamond,
      title: "Hope Diamond",
      description: "Chubb insured the Hope Diamond, a famous blue diamond weighing 45+ carats that's now on display at the Smithsonian Institution",
      color: "text-purple-600"
    },
    {
      icon: Skull,
      title: "Dinosaur Fossil",
      description: "Chubb insured the fossilized remains of a Tyrannosaurus Rex, nicknamed 'Sue' in 1997, which was later sold at an auction",
      color: "text-orange-600"
    },
    {
      icon: Building,
      title: "Empire State Building",
      description: "Chubb was one of the insurance companies that provided coverage for the construction of the iconic New York City skyscraper in the 1930s",
      color: "text-gray-600"
    },
    {
      icon: Music,
      title: "Eric Clapton's Guitar",
      description: "Chubb insured Eric Clapton's Fender Stratocaster Guitar, one of the most valuable musical instruments ever insured",
      color: "text-red-600"
    },
    {
      icon: Flame,
      title: "Olympic Torch",
      description: "Chubb provided insurance coverage for the Olympic torch used during the 2002 Winter Olympics in Salt Lake City, Utah",
      color: "text-yellow-600"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentFact((prev) => (prev + 1) % chubbFacts.length)
        setIsAnimating(false)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo width={32} height={32} className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">Chubb</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/claimant-login"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Claimant Portal
              </Link>
              <Link
                href="/auth/assessor-login"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Assessor Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-8 h-8 bg-blue-300 rounded-full opacity-40 animate-bounce"></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                {/* Main Headline */}
                <div className="mb-8">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                    <Zap className="h-4 w-4 mr-2" />
                    Powered by Advanced AI Technology
                  </div>
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
                    <span className="block">Chubb's Revolutionary</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                      Claims Intelligence
                    </span>
                  </h1>
                  <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 sm:text-2xl">
                    From the <span className="font-semibold text-blue-600">Titanic</span> to <span className="font-semibold text-purple-600">T-Rex fossils</span>, 
                    we've been protecting extraordinary assets for over a century. Now, our AI revolutionizes how we assess claims.
                  </p>
                </div>

                {/* Dynamic Chubb Facts Carousel */}
                <div className="mb-12">
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                      <div className="flex items-center justify-center mb-4">
                        <Star className="h-6 w-6 text-yellow-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Did You Know?</h3>
                        <Star className="h-6 w-6 text-yellow-500 ml-2" />
                      </div>
                      
                      <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
                        <div className="flex items-center justify-center mb-4">
                          {React.createElement(chubbFacts[currentFact].icon, {
                            className: `h-12 w-12 ${chubbFacts[currentFact].color}`
                          })}
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-3">
                          {chubbFacts[currentFact].title}
                        </h4>
                        <p className="text-gray-700 text-lg leading-relaxed">
                          {chubbFacts[currentFact].description}
                        </p>
                      </div>

                      {/* Fact Navigation Dots */}
                      <div className="flex justify-center mt-6 space-x-2">
                        {chubbFacts.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentFact(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                              index === currentFact 
                                ? 'bg-blue-600 scale-110' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Link
                    href={user && userProfile?.role === 'claimant' ? '/claimant-portal' : '/auth'}
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    {user && userProfile?.role === 'claimant' ? 'My Claims' : 'Claimant Portal'}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-200"></div>
                  </Link>
                  
                  <Link
                    href={user && (userProfile?.role === 'assessor' || userProfile?.role === 'admin') ? '/assessor-portal/overview' : '/auth'}
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    {user && (userProfile?.role === 'assessor' || userProfile?.role === 'admin') ? 'Assessment Dashboard' : 'Assessor Portal'}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-200"></div>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-12 flex flex-wrap justify-center items-center space-x-8 text-gray-500">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="text-sm font-medium">150+ Years of Trust</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-green-600" />
                    <span className="text-sm font-medium">Global Coverage</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                    <span className="text-sm font-medium">AI-Powered</span>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* DEBUG: Quick Car Analysis */}
      <div className="py-16 bg-gradient-to-br from-red-50 to-orange-50 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ClaimantImageAnalysis />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Platform</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Chubb Claims Intelligence Suite
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our proprietary technology revolutionizing how we assess and process insurance claims
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Eye className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Multimodal Analysis</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Our advanced computer vision and NLP technology analyzes images, documents, and narratives for comprehensive claim assessment.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Fraud Prevention</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Our proprietary algorithms detect image reuse, tampering, and narrative inconsistencies to protect against fraudulent claims.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Standardized Assessment</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Our AI-driven platform ensures consistent damage severity and cost estimation across all claims.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Integrated Workflow</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Seamlessly integrated into our claims processing pipeline with automated assessment and human oversight.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legendary Claims Section */}
      <div className="py-16 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-300 text-sm font-medium mb-4">
              <Trophy className="h-4 w-4 mr-2" />
              Legendary Claims in History
            </div>
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
              Extraordinary Coverage,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Extraordinary Stories
              </span>
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-300">
              For over 150 years, Chubb has protected the world's most valuable and unique assets. 
              Here are some of our most legendary claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Titanic Card */}
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Ship className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">RMS Titanic</h3>
                  <p className="text-blue-300 text-sm">1912 • Maritime Insurance</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Chubb insured the White Star Line, covering both the Titanic and Olympic. 
                One of the most famous maritime insurance claims in history.
              </p>
              <div className="mt-4 flex items-center text-yellow-400">
                <Star className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Historic Maritime Claim</span>
              </div>
            </div>

            {/* Hope Diamond Card */}
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Diamond className="h-8 w-8 text-purple-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Hope Diamond</h3>
                  <p className="text-purple-300 text-sm">45+ Carats • Smithsonian</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                The legendary blue diamond, now displayed at the Smithsonian Institution. 
                Chubb provided coverage for this priceless gemstone.
              </p>
              <div className="mt-4 flex items-center text-yellow-400">
                <Star className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Priceless Gemstone</span>
              </div>
            </div>

            {/* T-Rex Sue Card */}
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-orange-500/20 rounded-full">
                  <Skull className="h-8 w-8 text-orange-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">T-Rex "Sue"</h3>
                  <p className="text-orange-300 text-sm">1997 • Fossil Insurance</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                The most complete T-Rex skeleton ever found. Chubb insured this 
                67-million-year-old fossil before its record-breaking auction.
              </p>
              <div className="mt-4 flex items-center text-yellow-400">
                <Star className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Prehistoric Treasure</span>
              </div>
            </div>

            {/* Empire State Building Card */}
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gray-500/20 rounded-full">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Empire State Building</h3>
                  <p className="text-gray-300 text-sm">1930s • Construction</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Chubb provided coverage during the construction of this iconic NYC skyscraper, 
                one of the most ambitious building projects of its time.
              </p>
              <div className="mt-4 flex items-center text-yellow-400">
                <Star className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Architectural Icon</span>
              </div>
            </div>

            {/* Eric Clapton's Guitar Card */}
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <Music className="h-8 w-8 text-red-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Clapton's Stratocaster</h3>
                  <p className="text-red-300 text-sm">Fender • Music Legend</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Eric Clapton's legendary Fender Stratocaster, one of the most valuable 
                musical instruments ever insured by Chubb.
              </p>
              <div className="mt-4 flex items-center text-yellow-400">
                <Star className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Musical Masterpiece</span>
              </div>
            </div>

            {/* Olympic Torch Card */}
            <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-full">
                  <Flame className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Olympic Torch</h3>
                  <p className="text-yellow-300 text-sm">2002 • Salt Lake City</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Chubb provided insurance coverage for the Olympic torch during the 
                2002 Winter Olympics in Salt Lake City, Utah.
              </p>
              <div className="mt-4 flex items-center text-yellow-400">
                <Star className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Olympic Heritage</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xl text-gray-300 mb-6">
              Today, our AI technology continues this legacy of protecting extraordinary assets
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full">
              <Brain className="h-5 w-5 mr-2" />
              Powered by Advanced AI Claims Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Chubb Claims Performance
            </h2>
            <p className="mt-3 text-xl text-blue-200 sm:mt-4">
              Real results from our AI-powered claims intelligence platform
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Fraud Detection Rate
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">98%</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Processing Time Reduction
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">75%</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Assessment Accuracy
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">95%</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Access Chubb's</span>
            <span className="block text-blue-600">Claims Intelligence Platform</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/claimant-login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Claimant Portal
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/auth/assessor-login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
              >
                Assessor Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-bold text-gray-900">Chubb</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 Chubb. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Debug Button */}
      <FloatingDebugButton />
    </div>
  )
}

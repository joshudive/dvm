'use client'

import { useState } from 'react'
import { MapPin, Mail, Phone, Clock, Send, CheckCircle2, User, MessageSquare, Loader2, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.name || !formState.email || !formState.subject || !formState.message) {
      setError('Please fill in all the required fields.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Simulate standard professional contact form submit
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
      setFormState({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError('Something went wrong. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const contactDetails = [
    {
      icon: MapPin,
      title: 'Our Office',
      details: ['Divine Mercy Catholic Church', 'Mararaba, Area', 'Abuja, Nigeria'],
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
    },
    {
      icon: Phone,
      title: 'Phone Numbers',
      details: ['+234 901 262 2264', '+234 706 570 4850'],
      color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30'
    },
    {
      icon: Mail,
      title: 'Email Addresses',
      details: ['joshudive@gmail.com', 'cletus.ameh@gmail.com'],
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
    },
    // {
    //   icon: Clock,
    //   title: 'Working Hours',
    //   details: ['Monday – Friday', '9:00 AM – 5:00 PM (GMT+1)'],
    //   color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
    // }
  ]

  return (
    <main className="w-full grow bg-background font-sans selection:bg-primary/10 relative py-12 flex flex-col justify-center">
      {/* Dynamic Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary/5 blur-[130px]" />
        <div className="absolute top-[30%] right-[-5%] w-[35%] h-[35%] rounded-full bg-secondary/5 blur-[110px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold mb-6">
            <Trophy className="w-3.5 h-3.5" />
            <span>WE ARE ALWAYS HERE TO HELP</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Get in <span className="text-gradient">Touch</span> with Us
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed font-medium">
            Have questions about voting packages, contestants, or partnerships? Reach out, and our dedicated support team will get back to you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Details Grid (Left Side) */}
          <div className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-600">
            <h3 className="text-2xl font-extrabold tracking-tight mb-4 ml-1">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactDetails.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card p-6 rounded-4xl hover:scale-[1.03] transition-all duration-300 border border-muted hover:border-primary/20 flex flex-col h-full group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-foreground mb-2 text-base">{item.title}</h4>
                  <div className="space-y-1 mt-auto">
                    {item.details.map((detail, dIdx) => (
                      <p key={dIdx} className="text-xs text-muted-foreground font-medium leading-relaxed">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Note glass panel */}
            <div className="glass p-6 rounded-4xl border border-muted flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-foreground text-sm mb-1">Fast Response Guarantee</h5>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  We review and respond to all support emails and online submissions within 24 business hours.
                </p>
              </div>
            </div>
          </div>

          {/* Form Card (Right Side) */}
          <div className="lg:col-span-7 animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="glass-card p-8 sm:p-10 rounded-[2.5rem] border border-muted relative overflow-hidden shadow-2xl">
              {isSuccess ? (
                <div className="text-center py-12 px-4 space-y-6 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-green-500/20">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground">Message Sent!</h3>
                  <p className="text-muted-foreground font-semibold max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. Your message has been successfully received, and we will get back to you shortly.
                  </p>
                  <Button
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                    className="h-12 rounded-xl px-8 font-bold border-muted hover:bg-primary/5 hover:text-primary transition-all mt-4"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">Send Us a Message</h3>
                    <p className="text-muted-foreground text-sm font-medium">Use the form below to drop us a line directly.</p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold animate-in shake">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Name input */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            type="text"
                            name="name"
                            required
                            placeholder="John Doe"
                            className="h-14 pl-11 rounded-2xl bg-muted/10 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            value={formState.name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      {/* Email input */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            type="email"
                            name="email"
                            required
                            placeholder="john@example.com"
                            className="h-14 pl-11 rounded-2xl bg-muted/10 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            value={formState.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subject input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        Subject <span className="text-destructive">*</span>
                      </label>
                      <div className="relative group">
                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="text"
                          name="subject"
                          required
                          placeholder="How can we help you?"
                          className="h-14 pl-11 rounded-2xl bg-muted/10 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          value={formState.subject}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        Your Message <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        name="message"
                        required
                        rows={5}
                        placeholder="Write your message details here..."
                        className="rounded-2xl bg-muted/10 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium p-4"
                        value={formState.message}
                        onChange={handleInputChange}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-16 rounded-3xl text-lg font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

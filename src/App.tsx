import { AdminPage } from "@/components/admin/AdminPage"
import { PreferencesProvider } from "@/context/preferences"
import { Navbar } from "@/components/Navbar"
import { Hero } from "@/components/sections/Hero"
import { About } from "@/components/sections/About"
import { Experience } from "@/components/sections/Experience"
import { Skills } from "@/components/sections/Skills"
import { Projects } from "@/components/sections/Projects"
import { Education } from "@/components/sections/Education"
import { Contact } from "@/components/sections/Contact"
import { Footer } from "@/components/sections/Footer"

function App() {
  if (window.location.pathname.replace(/\/$/, "") === "/admin") {
    return <AdminPage />
  }

  return (
    <PreferencesProvider>
      <div className="min-h-svh bg-background text-foreground">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Experience />
          <Skills />
          <Projects />
          <Education />
          <Contact />
        </main>
        <Footer />
      </div>
    </PreferencesProvider>
  )
}

export default App

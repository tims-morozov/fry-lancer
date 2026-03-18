import { useState, useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

function App() {
  const [formData, setFormData] = useState({
    projectName: '',
    niche: '',
    goal: '',
    content: '',
    features: '',
    refs: '',
    antiRefs: '',
    materials: '',
    style: '',
    budget: '',
    deadline: '',
    contacts: '',
    timeToConnect: ''
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const downloadPDF = async () => {
    if (!previewRef.current) return
    setIsGenerating(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fdf1e2'
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`brief-${formData.projectName || 'project'}.pdf`)
    } catch (error) {
      console.error('PDF generation error:', error)
    }
    setIsGenerating(false)
  }

  const downloadDOCX = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `БРИФ: ${formData.projectName || 'БЕЗ НАЗВАНИЯ'}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          ...Object.entries({
            'Ниша и описание': formData.niche,
            'Цель сайта': formData.goal,
            'Контент': formData.content,
            'Функционал': formData.features,
            'Референсы': formData.refs,
            'Анти-референсы': formData.antiRefs,
            'Материалы': formData.materials,
            'Стиль и цвета': formData.style,
            'Бюджет': formData.budget,
            'Сроки': formData.deadline,
            'Контакты': formData.contacts,
            'Время для связи': formData.timeToConnect
          }).map(([key, value]) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${key}: `, bold: true, color: 'e8492a' }),
                new TextRun({ text: value || '—' })
              ],
              spacing: { before: 200, after: 200 }
            })
          ]).flat(),
          new Paragraph({
            text: "\n\nСгенерировано платформой FryLancer",
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 }
          })
        ]
      }]
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `brief-${formData.projectName || 'project'}.docx`)
  }

  const downloadMD = () => {
    const content = `
# Бриф на разработку проекта: ${formData.projectName || 'Без названия'}

## Основная информация
- **Ниша и описание бизнеса**: ${formData.niche || '—'}
- **Цель сайта**: ${formData.goal || '—'}
- **Контент (информация)**: ${formData.content || '—'}

## Функционал и дизайн
- **Желаемый функционал**: ${formData.features || '—'}
- **Референсы (что нравится)**: ${formData.refs || '—'}
- **Анти-референсы (что не нравится)**: ${formData.antiRefs || '—'}
- **Ссылка на материалы**: ${formData.materials || '—'}
- **Пожелания по стилю и цветам**: ${formData.style || '—'}

## Организационные моменты
- **Ориентировочный бюджет**: ${formData.budget || '—'}
- **Желаемые сроки**: ${formData.deadline || '—'}
- **Контактные данные**: ${formData.contacts || '—'}
- **Удобное время для связи**: ${formData.timeToConnect || '—'}

---
Сгенерировано платформой FryLancer
    `;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brief-${formData.projectName || 'project'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans antialiased selection:bg-brand-accent/20 selection:text-brand-accent">
      
      {/* Hidden Preview for PDF Generation */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={previewRef} className="w-[800px] p-20 bg-[#fdf1e2] text-[#342626]">
          <div className="flex items-center space-x-4 mb-12">
            <div className="h-1 w-20 bg-[#e8492a]"></div>
            <span className="text-[#e8492a] font-bold tracking-widest uppercase text-xs">Project Briefing</span>
          </div>
          <h1 className="text-6xl font-black uppercase mb-16 leading-none border-b-8 border-[#342626] pb-8">
            {formData.projectName || 'Название проекта'}
          </h1>
          
          <div className="space-y-12">
            {Object.entries({
              'Концепция': formData.niche,
              'Цели и задачи': formData.goal,
              'Функционал': formData.features,
              'Референсы': formData.refs,
              'Стиль': formData.style,
              'Бюджет': formData.budget,
              'Сроки': formData.deadline,
              'Контакты': formData.contacts
            }).map(([label, value]) => (
              <div key={label} className="grid grid-cols-4 gap-8">
                <div className="col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#e8492a] opacity-60">{label}</span>
                </div>
                <div className="col-span-3">
                  <p className="text-xl font-medium leading-relaxed">{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-24 pt-12 border-t border-[#342626]/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-30">
            <span>FryLancer Automation</span>
            <span>2026</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        
        {/* Header */}
        <header className="mb-24 space-y-6">
          <div className="flex items-center space-x-3">
            <span className="h-[1px] w-12 bg-brand-accent/30"></span>
            <span className="text-brand-accent font-bold tracking-[0.2em] text-[10px] uppercase">
              Professional Briefing
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-brand-text">
            Сфокусируйте <br /> ваш проект
          </h1>
          <p className="max-w-md text-brand-text/50 text-lg font-medium leading-relaxed">
            Заполните форму, и мы создадим структурированный документ для начала работы.
          </p>
        </header>

        {/* Form */}
        <form className="space-y-16">
          
          {/* Card Section 01 */}
          <div className="group bg-white/40 border border-brand-text/5 p-8 md:p-12 hover:bg-white/60 transition-all duration-500 rounded-2xl">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="md:w-1/3">
                <span className="text-brand-accent font-mono text-sm font-bold opacity-30">01</span>
                <h2 className="text-xl font-black uppercase tracking-tight mt-2">Концепция</h2>
                <p className="text-xs text-brand-text/40 mt-3 font-medium uppercase tracking-wider">Суть и описание</p>
              </div>
              <div className="md:w-2/3 space-y-8">
                <div className="relative">
                  <input 
                    type="text" name="projectName" value={formData.projectName} onChange={handleChange}
                    className="w-full bg-transparent border-b border-brand-text/10 py-4 text-xl font-bold outline-none focus:border-brand-accent transition-colors placeholder:text-brand-text/10"
                    placeholder="Название проекта"
                  />
                  <div className="absolute bottom-0 left-0 h-px bg-brand-accent w-0 group-focus-within:w-full transition-all duration-700"></div>
                </div>
                <div className="relative">
                  <textarea 
                    name="niche" value={formData.niche} onChange={handleChange} rows={3}
                    className="w-full bg-transparent border-b border-brand-text/10 py-4 text-lg font-medium outline-none focus:border-brand-accent transition-colors resize-none placeholder:text-brand-text/10"
                    placeholder="Ниша и описание бизнеса"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card Section 02 */}
          <div className="group bg-white/40 border border-brand-text/5 p-8 md:p-12 hover:bg-white/60 transition-all duration-500 rounded-2xl">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="md:w-1/3">
                <span className="text-brand-accent font-mono text-sm font-bold opacity-30">02</span>
                <h2 className="text-xl font-black uppercase tracking-tight mt-2">Детали</h2>
                <p className="text-xs text-brand-text/40 mt-3 font-medium uppercase tracking-wider">Функции и цели</p>
              </div>
              <div className="md:w-2/3 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <input type="text" name="goal" value={formData.goal} onChange={handleChange} className="bg-transparent border-b border-brand-text/10 py-4 outline-none focus:border-brand-accent transition-all placeholder:text-brand-text/10 font-bold" placeholder="Цель сайта" />
                  <input type="text" name="features" value={formData.features} onChange={handleChange} className="bg-transparent border-b border-brand-text/10 py-4 outline-none focus:border-brand-accent transition-all placeholder:text-brand-text/10 font-bold" placeholder="Функционал" />
                </div>
                <input type="text" name="refs" value={formData.refs} onChange={handleChange} className="w-full bg-transparent border-b border-brand-text/10 py-4 outline-none focus:border-brand-accent transition-all placeholder:text-brand-text/10 font-bold" placeholder="Ссылки на референсы" />
              </div>
            </div>
          </div>

          {/* Card Section 03 */}
          <div className="group bg-white/40 border border-brand-text/5 p-8 md:p-12 hover:bg-white/60 transition-all duration-500 rounded-2xl">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="md:w-1/3">
                <span className="text-brand-accent font-mono text-sm font-bold opacity-30">03</span>
                <h2 className="text-xl font-black uppercase tracking-tight mt-2">Условия</h2>
                <p className="text-xs text-brand-text/40 mt-3 font-medium uppercase tracking-wider">Связь и бюджет</p>
              </div>
              <div className="md:w-2/3 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <input type="text" name="budget" value={formData.budget} onChange={handleChange} className="bg-transparent border-b border-brand-text/10 py-4 outline-none focus:border-brand-accent transition-all placeholder:text-brand-text/10 font-bold" placeholder="Бюджет" />
                  <input type="text" name="deadline" value={formData.deadline} onChange={handleChange} className="bg-transparent border-b border-brand-text/10 py-4 outline-none focus:border-brand-accent transition-all placeholder:text-brand-text/10 font-bold" placeholder="Сроки" />
                </div>
                <input type="text" name="contacts" value={formData.contacts} onChange={handleChange} className="w-full bg-transparent border-b border-brand-text/10 py-4 outline-none focus:border-brand-accent transition-all placeholder:text-brand-text/10 font-bold" placeholder="Ваши контакты" />
              </div>
            </div>
          </div>

          {/* Download Buttons Group */}
          <div className="space-y-4 pt-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/30 text-right">Выберите формат экспорта</p>
            <div className="flex flex-wrap justify-end gap-4">
              <button 
                type="button"
                onClick={downloadMD}
                className="px-6 py-3 border border-brand-text/10 text-brand-text/60 font-bold uppercase tracking-widest text-xs hover:bg-brand-text hover:text-white transition-all active:scale-95"
              >
                Markdown (.md)
              </button>
              <button 
                type="button"
                onClick={downloadDOCX}
                className="px-6 py-3 border border-brand-text/10 text-brand-text/60 font-bold uppercase tracking-widest text-xs hover:bg-brand-text hover:text-white transition-all active:scale-95"
              >
                Word (.docx)
              </button>
              <button 
                type="button"
                disabled={isGenerating}
                onClick={downloadPDF}
                className="px-10 py-3 bg-brand-accent text-white font-black uppercase tracking-widest text-xs hover:bg-brand-text transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? 'Генерация...' : 'Скачать PDF'}
              </button>
            </div>
          </div>

        </form>

        {/* Footer */}
        <footer className="mt-40 pt-12 border-t border-brand-text/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/20">
          <div>FryLancer / MVP Platform</div>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <span>© 2026</span>
            <a href="#" className="hover:text-brand-accent transition-colors">Documentation</a>
            <a href="#" className="hover:text-brand-accent transition-colors">Support</a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App

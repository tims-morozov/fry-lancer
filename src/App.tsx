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
  const [step, setStep] = useState(1)
  const totalSteps = 4
  const previewRef = useRef<HTMLDivElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

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
    <div className="min-h-screen bg-brand-bg text-brand-text-dark font-sans antialiased">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-text-dark">FryLancer</span>
          </div>
          <button 
            onClick={() => setStep(1)}
            className="px-4 py-2 bg-brand-accent text-white text-sm font-bold rounded-full hover:bg-orange-600 transition-all active:scale-95 shadow-sm shadow-orange-200"
          >
            Начать заново
          </button>
        </div>
      </header>

      {/* Hidden Preview for PDF Generation */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={previewRef} className="w-[800px] p-20 bg-white text-[#1e293b]">
          <div className="flex items-center space-x-4 mb-12">
            <div className="h-1 w-20 bg-brand-accent"></div>
            <span className="text-brand-accent font-bold tracking-widest uppercase text-xs">Project Briefing</span>
          </div>
          <h1 className="text-6xl font-black uppercase mb-16 leading-none border-b-8 border-brand-text-dark pb-8">
            {formData.projectName || 'Название проекта'}
          </h1>
          
          <div className="space-y-12">
            {Object.entries({
              'Концепция': formData.niche,
              'Цели и задачи': formData.goal,
              'Контент': formData.content,
              'Функционал': formData.features,
              'Референсы': formData.refs,
              'Анти-референсы': formData.antiRefs,
              'Материалы': formData.materials,
              'Стиль': formData.style,
              'Бюджет': formData.budget,
              'Сроки': formData.deadline,
              'Контакты': formData.contacts,
              'Время для связи': formData.timeToConnect
            }).map(([label, value]) => (
              <div key={label} className="grid grid-cols-4 gap-8">
                <div className="col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent opacity-60">{label}</span>
                </div>
                <div className="col-span-3">
                  <p className="text-xl font-medium leading-relaxed">{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-24 pt-12 border-t border-brand-text-dark/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-30">
            <span>FryLancer Automation</span>
            <span>2026</span>
          </div>
        </div>
      </div>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          
          {/* Step Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text-light">Шаг {step} из {totalSteps}</span>
              <span className="text-xs font-bold text-brand-accent">{Math.round((step / totalSteps) * 100)}% завершено</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-accent transition-all duration-500 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i <= step ? 'bg-brand-accent scale-110' : 'bg-slate-300'}`}
                ></div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-500">
            <div className="p-8 md:p-12">
              
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                      <h2 className="text-3xl font-bold text-brand-text-dark tracking-tight">Расскажите о проекте</h2>
                      <p className="text-brand-text-light mt-2">Начнем с базовой информации о вашей идее.</p>
                    </header>
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-bold text-brand-text-dark mb-2 block">Название проекта</span>
                        <input 
                          type="text" name="projectName" value={formData.projectName} onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all placeholder:text-slate-400"
                          placeholder="Например: FryLancer SaaS"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-bold text-brand-text-dark mb-2 block">Ниша и описание</span>
                        <textarea 
                          name="niche" value={formData.niche} onChange={handleChange} rows={4}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all resize-none placeholder:text-slate-400"
                          placeholder="Чем занимается бизнес?"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                      <h2 className="text-3xl font-bold text-brand-text-dark tracking-tight">Цели и функции</h2>
                      <p className="text-brand-text-light mt-2">Что должен делать сайт и какую задачу решать?</p>
                    </header>
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-bold text-brand-text-dark mb-2 block">Главная цель</span>
                        <input 
                          type="text" name="goal" value={formData.goal} onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all placeholder:text-slate-400"
                          placeholder="Например: Сбор заявок на услуги"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-bold text-brand-text-dark mb-2 block">Желаемый функционал</span>
                        <textarea 
                          name="features" value={formData.features} onChange={handleChange} rows={4}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all resize-none placeholder:text-slate-400"
                          placeholder="Личный кабинет, оплата, блог..."
                        />
                      </label>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                      <h2 className="text-3xl font-bold text-brand-text-dark tracking-tight">Визуал и материалы</h2>
                      <p className="text-brand-text-light mt-2">Поделитесь вашим видением стиля.</p>
                    </header>
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-bold text-brand-text-dark mb-2 block">Референсы (что нравится)</span>
                        <input 
                          type="text" name="refs" value={formData.refs} onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all placeholder:text-slate-400"
                          placeholder="Ссылки на сайты или Behance"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-bold text-brand-text-dark mb-2 block">Пожелания по стилю</span>
                        <textarea 
                          name="style" value={formData.style} onChange={handleChange} rows={4}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all resize-none placeholder:text-slate-400"
                          placeholder="Минимализм, темная тема, яркие акценты..."
                        />
                      </label>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                      <h2 className="text-3xl font-bold text-brand-text-dark tracking-tight">Финальные штрихи</h2>
                      <p className="text-brand-text-light mt-2">Бюджет, сроки и ваши контакты.</p>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-bold text-brand-text-dark mb-2 block">Бюджет</span>
                        <input 
                          type="text" name="budget" value={formData.budget} onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all placeholder:text-slate-400"
                          placeholder="От 100 000 ₽"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-bold text-brand-text-dark mb-2 block">Сроки</span>
                        <input 
                          type="text" name="deadline" value={formData.deadline} onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all placeholder:text-slate-400"
                          placeholder="2 месяца"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-sm font-bold text-brand-text-dark mb-2 block">Ваши контакты</span>
                      <input 
                        type="text" name="contacts" value={formData.contacts} onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all placeholder:text-slate-400"
                        placeholder="Telegram, WhatsApp или Email"
                      />
                    </label>

                    <div className="pt-6 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-text-light text-center">Готово! Выберите формат экспорта:</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          type="button"
                          onClick={downloadPDF}
                          disabled={isGenerating}
                          className="flex-1 px-6 py-4 bg-brand-accent text-white font-bold rounded-xl hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-200"
                        >
                          {isGenerating ? 'Генерация...' : 'Скачать PDF'}
                        </button>
                        <div className="flex gap-3">
                          <button 
                            type="button"
                            onClick={downloadDOCX}
                            className="p-4 bg-slate-100 text-brand-text-dark font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                            title="Word (.docx)"
                          >
                            DOCX
                          </button>
                          <button 
                            type="button"
                            onClick={downloadMD}
                            className="p-4 bg-slate-100 text-brand-text-dark font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                            title="Markdown (.md)"
                          >
                            MD
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className={`flex items-center pt-4 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
                  {step > 1 && (
                    <button 
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 text-brand-text-light font-bold hover:text-brand-text-dark transition-colors flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      <span>Назад</span>
                    </button>
                  )}
                  {step < totalSteps && (
                    <button 
                      type="button"
                      onClick={nextStep}
                      className="px-8 py-3 bg-brand-text-dark text-white font-bold rounded-xl hover:bg-slate-700 transition-all active:scale-95 flex items-center space-x-2"
                    >
                      <span>Далее</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-6 py-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
        <div>FryLancer / MVP Platform</div>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <span>© 2026</span>
          <a href="#" className="hover:text-brand-accent transition-colors">Documentation</a>
          <a href="#" className="hover:text-brand-accent transition-colors">Support</a>
        </div>
      </footer>
    </div>
  )
}

export default App

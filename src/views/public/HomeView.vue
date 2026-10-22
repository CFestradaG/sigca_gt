<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();

const carouselImages = [
  {
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80',
    caption: 'Espacio lúdico y terapéutico diseñado con iluminación natural y calidez en Ciudad de Guatemala.',
    tag: 'Terapia Infantil',
  },
  {
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    caption: 'Sesiones personalizadas de Estimulación Auditivo-Verbal para niños con implante coclear.',
    tag: 'Audición y Lenguaje',
  },
  {
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    caption: 'Evaluaciones neuropsicológicas y de madurez del aprendizaje en ambiente seguro y confiable.',
    tag: 'Neurodesarrollo',
  },
  {
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Trabajo fonoaudiológico con material didáctico interactivo de alta calidad sensorial.',
    tag: 'Estimulación del Habla',
  },
  {
    url: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Escuela para padres y acompañamiento emocional continuo a todo el núcleo familiar.',
    tag: 'Orientación Familiar',
  },
];

const currentSlide = ref(0);
let timer: any = null;

onMounted(() => {
  timer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % carouselImages.length;
  }, 4500);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + carouselImages.length) % carouselImages.length;
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % carouselImages.length;
};
</script>

<template>
  <div class="flex flex-col w-full">
    <!-- Hero Section -->
    <section class="relative w-full overflow-hidden bg-[#fef9f0] py-12 lg:py-20 border-b border-[#ece8df]">
      <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#00685d]/5 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-[#a33d23]/5 blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Hero Copy -->
          <div class="lg:col-span-7 flex flex-col gap-6">
            <div class="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#00685d]/10 text-[#00685d] text-xs font-semibold">
              <span class="material-symbols-outlined text-[16px]">health_and_safety</span>
              <span>Salud Mental • Estimulación Auditivo-Verbal Certificada</span>
            </div>

            <h1 class="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1d1c16] tracking-tight leading-[1.15]">
              Un espacio cálido donde cada voz y cada emoción encuentran su ritmo
            </h1>

            <p class="text-base sm:text-lg text-[#3d4947] leading-relaxed max-w-2xl">
              Acompañamos con empatía el desarrollo integral de niños, jóvenes y familias en Guatemala. Especialistas en psicología infanto-juvenil, bienestar emocional y terapia de estimulación auditiva con enfoque centrado en la familia.
            </p>

            <div class="flex flex-wrap items-center gap-4 pt-2">
              <router-link
                to="/agendar-cita"
                class="inline-flex items-center justify-center gap-2 bg-[#a33d23] text-white font-semibold text-base px-6 py-3.5 rounded-xl shadow-sm hover:bg-[#83260e] transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-xl">calendar_add_on</span>
                <span>Agendar Primera Valoración</span>
              </router-link>

              <router-link
                to="/servicios"
                class="inline-flex items-center justify-center gap-2 bg-[#f2ede4] text-[#00685d] font-semibold text-base px-6 py-3.5 rounded-xl border border-[#bcc9c6] hover:bg-[#ece8df] transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-xl">explore</span>
                <span>Conocer Servicios y Tarifas</span>
              </router-link>
            </div>

            <!-- Quick Trust note -->
            <div class="flex items-center gap-2 text-xs sm:text-sm text-[#3d4947] pt-2">
              <span class="material-symbols-outlined text-[#00685d] text-[18px]">verified</span>
              <span>Atención presencial en Zona 10 (Edificio Sixtino II) y Zona 14 (Europlaza)</span>
            </div>
          </div>

          <!-- Hero Visual -->
          <div class="lg:col-span-5 relative">
            <div class="relative bg-white rounded-2xl p-4 shadow-lg border border-[#e7e2d9]">
              <img
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80"
                alt="Clínica Centro Armonía"
                class="w-full h-80 sm:h-96 object-cover rounded-xl"
              />

              <!-- Floating Credential Card -->
              <div class="absolute -bottom-5 -left-5 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl max-w-xs border border-[#e7e2d9] flex items-center gap-3">
                <div class="w-11 h-11 rounded-full bg-[#00685d]/10 text-[#00685d] flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-2xl">hearing</span>
                </div>
                <div>
                  <h3 class="font-heading font-bold text-sm text-[#1d1c16]">Audición & Voz</h3>
                  <p class="text-xs text-[#3d4947]">Prácticas clínicas avaladas internacionalmente</p>
                </div>
              </div>

              <!-- Floating Badge Top Right -->
              <div class="absolute -top-3 -right-3 bg-[#a33d23] text-white px-3.5 py-1.5 rounded-full shadow-md text-xs font-bold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">favorite</span>
                <span>Atención 1 a 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Carousel Section (RF-01: Carrusel con al menos 5 imágenes) -->
    <section class="py-14 bg-[#f8f3ea] border-b border-[#e7e2d9]">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span class="text-xs uppercase tracking-wider text-[#00685d] font-bold">Instalaciones y Terapias</span>
            <h2 class="font-heading font-bold text-2xl sm:text-3xl text-[#1d1c16] mt-1">
              Conozca Centro Armonía en Imágenes
            </h2>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="prevSlide"
              class="w-10 h-10 rounded-xl bg-white border border-[#bcc9c6] text-[#00685d] flex items-center justify-center hover:bg-[#f2ede4] transition-all cursor-pointer"
              aria-label="Anterior imagen"
            >
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              @click="nextSlide"
              class="w-10 h-10 rounded-xl bg-white border border-[#bcc9c6] text-[#00685d] flex items-center justify-center hover:bg-[#f2ede4] transition-all cursor-pointer"
              aria-label="Siguiente imagen"
            >
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <!-- Main Slide Card -->
        <div class="relative rounded-2xl overflow-hidden shadow-md bg-white border border-[#e7e2d9] h-[360px] sm:h-[460px]">
          <img
            :src="carouselImages[currentSlide].url"
            :alt="carouselImages[currentSlide].tag"
            class="w-full h-full object-cover transition-opacity duration-700"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
            <span class="inline-block px-3 py-1 rounded-full bg-[#00685d] text-white text-xs font-bold uppercase tracking-wide self-start mb-2">
              {{ carouselImages[currentSlide].tag }}
            </span>
            <p class="text-base sm:text-xl font-medium max-w-3xl leading-relaxed">
              {{ carouselImages[currentSlide].caption }}
            </p>
          </div>
        </div>

        <!-- Dots Indicator -->
        <div class="flex justify-center gap-2.5 mt-5">
          <button
            v-for="(_, idx) in carouselImages"
            :key="idx"
            @click="currentSlide = idx"
            class="h-2.5 rounded-full transition-all cursor-pointer"
            :class="currentSlide === idx ? 'w-8 bg-[#00685d]' : 'w-2.5 bg-[#bcc9c6]'"
            :aria-label="`Ir a imagen ${idx + 1}`"
          />
        </div>
      </div>
    </section>

    <!-- Services Showcase Section -->
    <section class="py-16 bg-[#fef9f0] border-b border-[#e7e2d9]">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-xs uppercase tracking-wider text-[#a33d23] font-bold">Nuestra Especialidad</span>
          <h2 class="font-heading font-bold text-3xl sm:text-4xl text-[#1d1c16] mt-2">
            Servicios Clínicos y Terapéuticos
          </h2>
          <p class="text-sm sm:text-base text-[#3d4947] mt-3">
            Programas diseñados con evaluación continua y participación activa de los padres y cuidadores.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="srv in store.services.slice(0, 3)"
            :key="srv.id"
            class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-[#e7e2d9] flex flex-col"
          >
            <div class="h-48 relative overflow-hidden">
              <img
                :src="srv.imagenUrl"
                :alt="srv.nombre"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute top-3 right-3 bg-[#fef9f0]/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#00685d] border border-[#bcc9c6]">
                {{ srv.duracionMinutos }} min
              </div>
            </div>

            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span class="text-xs font-semibold text-[#a33d23] uppercase tracking-wider">
                  {{ srv.categoria }}
                </span>
                <h3 class="font-heading font-bold text-xl text-[#1d1c16] mt-1 mb-2">
                  {{ srv.nombre }}
                </h3>
                <p class="text-sm text-[#3d4947] line-clamp-3 leading-relaxed">
                  {{ srv.descripcion }}
                </p>
              </div>

              <div class="pt-6 border-t border-[#ece8df] mt-6 flex items-center justify-between">
                <div>
                  <span class="text-xs text-[#6d7a77] block font-medium">Honorarios</span>
                  <span class="text-xl font-extrabold text-[#00685d]">
                    Q {{ srv.precioQ.toFixed(2) }}
                  </span>
                </div>

                <router-link
                  to="/agendar-cita"
                  class="px-4 py-2 bg-[#a33d23] hover:bg-[#83260e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Solicitar Cita
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-10">
          <router-link
            to="/servicios"
            class="inline-flex items-center gap-2 text-sm font-bold text-[#00685d] hover:text-[#008376] cursor-pointer"
          >
            <span>Ver todos los tratamientos y detalles clínicos</span>
            <span class="material-symbols-outlined text-lg">arrow_forward</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Trust & Testimonial Section -->
    <section class="py-16 bg-[#f8f3ea]">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div class="lg:col-span-5 space-y-4">
            <span class="text-xs uppercase tracking-wider text-[#00685d] font-bold">Voces de Nuestra Comunidad</span>
            <h2 class="font-heading font-bold text-3xl text-[#1d1c16]">
              El impacto en la vida cotidiana de las familias
            </h2>
            <p class="text-sm text-[#3d4947] leading-relaxed">
              Cada avance en el lenguaje, cada risa compartida y cada paso hacia la autonomía es una victoria que celebramos en conjunto.
            </p>
            <div class="pt-4 flex items-center gap-6">
              <div>
                <span class="block font-heading font-extrabold text-3xl text-[#00685d]">+850</span>
                <span class="text-xs text-[#3d4947]">Familias atendidas</span>
              </div>
              <div class="w-px h-10 bg-[#bcc9c6]"></div>
              <div>
                <span class="block font-heading font-extrabold text-3xl text-[#00685d]">98%</span>
                <span class="text-xs text-[#3d4947]">Satisfacción clínica</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-xs border border-[#e7e2d9] space-y-3">
              <div class="flex text-[#a33d23]">
                <span v-for="i in 5" :key="i" class="material-symbols-outlined text-base fill">star</span>
              </div>
              <p class="text-sm text-[#3d4947] italic leading-relaxed">
                "El acompañamiento para Mateo y su implante coclear ha sido extraordinario. En Centro Armonía no solo atienden a nuestro hijo, nos educan y empoderan a nosotros como papás."
              </p>
              <div class="pt-2">
                <h4 class="font-heading font-bold text-sm text-[#1d1c16]">Mariana Gómez & Carlos Méndez</h4>
                <span class="text-xs text-[#6d7a77]">Padres de Mateo (5 años)</span>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-xs border border-[#e7e2d9] space-y-3">
              <div class="flex text-[#a33d23]">
                <span v-for="i in 5" :key="i" class="material-symbols-outlined text-base fill">star</span>
              </div>
              <p class="text-sm text-[#3d4947] italic leading-relaxed">
                "La calidez de la Licda. Sofía y de todo el equipo en Sixtino II nos devolvió la tranquilidad. Sofía ha ganado seguridad para comunicarse y regular sus emociones."
              </p>
              <div class="pt-2">
                <h4 class="font-heading font-bold text-sm text-[#1d1c16]">Lorena Pineda</h4>
                <span class="text-xs text-[#6d7a77]">Mamá de Sofía (7 años)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Bottom Banner -->
    <section class="py-14 bg-[#00685d] text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-5">
        <h2 class="font-heading font-bold text-2xl sm:text-3xl">
          ¿Desea orientación para iniciar el proceso de su hijo?
        </h2>
        <p class="text-sm sm:text-base text-[#8cf5e4] max-w-2xl mx-auto">
          Nuestro equipo de recepción y especialistas está disponible para resolver sus dudas y programar una cita diagnóstica o de primera vez.
        </p>
        <div class="flex flex-wrap justify-center gap-4 pt-2">
          <router-link
            to="/agendar-cita"
            class="px-6 py-3 bg-[#a33d23] hover:bg-[#ff8162] text-white font-semibold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
          >
            Agendar Valoración Inicial
          </router-link>
          <router-link
            to="/horarios-contacto"
            class="px-6 py-3 bg-[#008376] hover:bg-[#005048] text-white font-semibold rounded-xl text-sm border border-[#8cf5e4]/30 transition-colors cursor-pointer"
          >
            Consultar Horarios y Sedes
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

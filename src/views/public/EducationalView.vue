<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();
const activeTab = ref<'articulos' | 'recursos'>('articulos');
</script>

<template>
  <div class="py-12 bg-[#fef9f0]">
    <div class="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="text-xs font-bold uppercase tracking-wider text-[#00685d]">
          Biblioteca & Orientación Familiar
        </span>
        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-[#1d1c16]">
          Contenido Educativo y Recursos Clínicos
        </h1>
        <p class="text-base text-[#3d4947]">
          Artículos, consejos prácticos para el hogar y herramientas para enriquecer la comunicación diaria.
        </p>
      </div>

      <!-- Tab switch -->
      <div class="flex justify-center">
        <div class="bg-[#f2ede4] p-1 rounded-xl inline-flex border border-[#e7e2d9]">
          <button
            @click="activeTab = 'articulos'"
            class="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            :class="activeTab === 'articulos' ? 'bg-white text-[#00685d] shadow-xs' : 'text-[#3d4947] hover:text-[#1d1c16]'"
          >
            Artículos y Publicaciones ({{ store.content.posts.length }})
          </button>
          <button
            @click="activeTab = 'recursos'"
            class="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            :class="activeTab === 'recursos' ? 'bg-white text-[#00685d] shadow-xs' : 'text-[#3d4947] hover:text-[#1d1c16]'"
          >
            Materiales y Fichas de Apoyo ({{ store.materials.filter((m) => m.estado === 'ACTIVO').length }})
          </button>
        </div>
      </div>

      <!-- Articles List -->
      <div v-if="activeTab === 'articulos'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article
          v-for="post in store.content.posts"
          :key="post.id"
          class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-[#e7e2d9] flex flex-col justify-between"
        >
          <div>
            <div class="h-48 relative overflow-hidden">
              <img
                :src="post.imagenUrl"
                :alt="post.titulo"
                class="w-full h-full object-cover"
              />
              <div class="absolute top-3 left-3 bg-[#00685d] text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                {{ post.categoria }}
              </div>
            </div>

            <div class="p-6 space-y-3">
              <span class="text-xs text-[#6d7a77] flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">calendar_today</span>
                <span>{{ post.fechaPublicacion }}</span>
              </span>
              <h3 class="font-heading font-bold text-lg text-[#1d1c16] leading-snug">
                {{ post.titulo }}
              </h3>
              <p class="text-sm text-[#3d4947] leading-relaxed">
                {{ post.descripcion }}
              </p>
            </div>
          </div>

          <div class="p-6 pt-0">
            <button class="text-xs font-bold text-[#00685d] hover:text-[#008376] flex items-center gap-1 cursor-pointer">
              <span>Leer artículo completo</span>
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </article>
      </div>

      <!-- Materials List -->
      <div v-if="activeTab === 'recursos'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="mat in store.materials.filter((m) => m.estado === 'ACTIVO')"
          :key="mat.id"
          class="bg-white p-6 rounded-2xl shadow-sm border border-[#e7e2d9] flex items-start gap-4"
        >
          <div class="w-12 h-12 rounded-xl bg-[#00685d]/10 text-[#00685d] flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-2xl">
              {{ mat.tipo === 'AUDIO' ? 'audiotrack' : mat.tipo === 'VIDEO' ? 'movie' : 'description' }}
            </span>
          </div>
          <div class="flex-1 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#a33d23] px-2 py-0.5 rounded bg-[#ffdad2]">
                {{ mat.tipo }}
              </span>
              <span class="text-xs text-[#6d7a77]">{{ mat.fechaRegistro }}</span>
            </div>
            <h4 class="font-heading font-bold text-base text-[#1d1c16]">{{ mat.titulo }}</h4>
            <p class="text-xs text-[#3d4947] leading-relaxed">{{ mat.descripcion }}</p>
            <div class="pt-2">
              <a
                :href="mat.enlaceRecurso"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1 text-xs font-bold text-[#00685d] hover:underline"
              >
                <span class="material-symbols-outlined text-sm">download</span>
                <span>Descargar recurso gratuito</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

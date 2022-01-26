(window.webpackJsonp=window.webpackJsonp||[]).push([[20],{474:function(e,t,s){e.exports=s.p+"assets/img/Screen_Shot_2021-12-21_at_10.01.19_PM.d6bd0b95.png"},507:function(e,t,s){"use strict";s.r(t);var n=s(56),a=Object(n.a)({},(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[n("h1",{attrs:{id:"historical-background"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#historical-background"}},[e._v("#")]),e._v(" Historical Background")]),e._v(" "),n("h2",{attrs:{id:"multi-core-heterogeneous-systems"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#multi-core-heterogeneous-systems"}},[e._v("#")]),e._v(" "),n("em",[e._v("Multi-core + Heterogeneous Systems")])]),e._v(" "),n("p",[e._v("In recent years, more and more sequential solutions are being replaced with multi-core solutions. The physical limitation has caused the processor capability to level off, so the effort is naturally being placed to use multiple processors in parallel. The heterogeneous system such as the CPU+GPU system is becoming more common as well.")]),e._v(" "),n("p",[e._v('The GPU is a processor designed for graphics processing, but its parallel architecture containing up to hundreds of cores makes it suited for data parallel processes. The GPGPU (General Purpose GPU), which uses the GPU for tasks other than graphics processing, has been attracting attention as a result3. NVIDIA\'s CUDA has made the programming much simpler, as it allows the CPU for performing general tasks and the GPU for data parallel tasks4. NVIDIA makes GPUs for graphics processing, as well as GPUs specialized for GPGPU called "Tesla".')]),e._v(" "),n("p",[n("strong",[e._v("Figure 2.1")]),e._v(" shows an example of a heterogeneous system using a GPU as an accelerator. The chip that was used in PLAYSTATION3 called the CELL/B.E. is made up of 2 different types of cores, called PPE and SPE. This is an example of a heterogeneous environment contained in one chip. A similar chip is the ARM SoC (System on Chip) used in cell phones and tablet PCs, which contains different cores on a chip.")]),e._v(" "),n("h2",{attrs:{id:"vendor-dependent-development-environment"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#vendor-dependent-development-environment"}},[e._v("#")]),e._v(" "),n("em",[e._v("Vendor-dependent Development Environment")])]),e._v(" "),n("p",[e._v("We will now take a look at software development in a heterogeneous environment.")]),e._v(" "),n("p",[e._v("First, we will take a look at CUDA, which is a way to write generic code to be run on the GPU. Since no OS is running on the GPU, the CPU must perform tasks such as code execution, file system management, and the user interface, so that the data parallel computations can be performed on the GPU.")]),e._v(" "),n("p",[e._v('In CUDA, the control management side (CPU) is called the "host", and the data parallel side (GPU) is called the "device". The CPU side program is called the host program, and the GPU side program is called the kernel. The main difference between CUDA and the normal development process is that the kernel must be written in the CUDA language, which is an extension of the C language. An example kernel code is shown in '),n("strong",[e._v("List 2.1")]),e._v(".")]),e._v(" "),n("p",[n("strong",[e._v("List 2.1: Example Kernel Code")])]),e._v(" "),n("blockquote",[n("p",[e._v("001: __global__ void vecAdd(float *A, float *B, float *C) /* Code to be executed on the GPU (kernel) */")]),e._v(" "),n("p",[e._v("002: {")]),e._v(" "),n("p",[e._v("003: int tid = threadIdx.x; /* Get thread ID */")]),e._v(" "),n("p",[e._v("004:")]),e._v(" "),n("p",[e._v("005: C[tid] = A[tid] + B[tid];")]),e._v(" "),n("p",[e._v("006:")]),e._v(" "),n("p",[e._v("007: return;")]),e._v(" "),n("p",[e._v("008: }")])]),e._v(" "),n("p",[e._v("The kernel is called from the CPU-side, as shown in "),n("strong",[e._v("List 2.2")]),e._v("5.")]),e._v(" "),n("blockquote",[n("p",[e._v("001: int main(void) /* Code to be ran on the CPU */")]),e._v(" "),n("p",[e._v("002: {")]),e._v(" "),n("p",[e._v("003: …")]),e._v(" "),n("p",[e._v("004: vecAdd<<<1, 256>>>(dA, dB, dC); /* kernel call（256 threads） */")]),e._v(" "),n("p",[e._v("005: …")]),e._v(" "),n("p",[e._v("006: }")])]),e._v(" "),n("p",[e._v('The Cell/B.E. is programmed using the "Cell SDK" released by IBM6. The Cell/B.E. comprises of a PPE for control, and 8 SPEs for computations, each requiring specific compilers. Although it does not extend a language like the CUDA, the SPE must be controlled by the PPE, using specific library functions provided by the Cell SDK. Similarly, specific library functions are required in order to run, for example, SIMD instructions on the SPE.')]),e._v(" "),n("p",[e._v("You may have noticed that the structures of the two heterogeneous systems are same, with the control being done on the CPU/PPE, and the computation being performed on GPU/SPE. However, the programmers must learn two distinct sets of APIs. ("),n("strong",[e._v("Table 2.1")]),e._v(")")]),e._v(" "),n("p",[n("strong",[e._v("Table 2.1: Example Cell/B.E. API commands")])]),e._v(" "),n("table",[n("thead",[n("tr",[n("th",{staticStyle:{"text-align":"center"}},[e._v("Function")]),e._v(" "),n("th",{staticStyle:{"text-align":"center"}},[e._v("API")])])]),e._v(" "),n("tbody",[n("tr",[n("td",{staticStyle:{"text-align":"center"}},[e._v("Open SPE program")]),e._v(" "),n("td",{staticStyle:{"text-align":"center"}},[e._v("spe_image_open()")])]),e._v(" "),n("tr",[n("td",{staticStyle:{"text-align":"center"}},[e._v("Create SPE context")]),e._v(" "),n("td",{staticStyle:{"text-align":"center"}},[e._v("spe_context_create()")])]),e._v(" "),n("tr",[n("td",{staticStyle:{"text-align":"center"}},[e._v("Load SPE program")]),e._v(" "),n("td",{staticStyle:{"text-align":"center"}},[e._v("spe_context_load()")])]),e._v(" "),n("tr",[n("td",{staticStyle:{"text-align":"center"}},[e._v("Execute SPE program")]),e._v(" "),n("td",{staticStyle:{"text-align":"center"}},[e._v("spe_context_run()")])]),e._v(" "),n("tr",[n("td",{staticStyle:{"text-align":"center"}},[e._v("Delete SPE context")]),e._v(" "),n("td",{staticStyle:{"text-align":"center"}},[e._v("spe_context_destroy()")])]),e._v(" "),n("tr",[n("td",{staticStyle:{"text-align":"center"}},[e._v("Close SPE program")]),e._v(" "),n("td",{staticStyle:{"text-align":"center"}},[e._v("spe_image_close()")])])])]),e._v(" "),n("p",[e._v("In order to run the same instruction on different processors, the programmer is required to learn processor-specific instructions. As an example, in order to perform a SIMD instruction, x86, PPE, SPE must call a SSE instruction, a VMX instruction, and a SPE-embedded instruction, respectively. ("),n("strong",[e._v("Table 2.2")]),e._v(")")]),e._v(" "),n("p",[n("strong",[e._v("Table 2.2: SIMD ADD instructions on different processors")])]),e._v(" "),n("table",[n("thead",[n("tr",[n("th",{staticStyle:{"text-align":"center"}},[e._v("X86 (SSE3)")]),e._v(" "),n("th",{staticStyle:{"text-align":"center"}},[e._v("PowerPC (PPE)")]),e._v(" "),n("th",{staticStyle:{"text-align":"center"}},[e._v("SPE")])])]),e._v(" "),n("tbody",[n("tr",[n("td",{staticStyle:{"text-align":"center"}},[e._v("_mm_add_ps()")]),e._v(" "),n("td",{staticStyle:{"text-align":"center"}},[e._v("vec_add()")]),e._v(" "),n("td",{staticStyle:{"text-align":"center"}},[e._v("spu_add()")])])])]),e._v(" "),n("p",[e._v("Additionally, in the embedded electronics field, a similar model is used, where the CPU manages the DSPs suited for signal processing. Even here, the same sort of procedure is performed, using a completely different set of APIs.")]),e._v(" "),n("p",[n("strong",[e._v("Figure 2.2: Combination example of controlling and arithmetic")])]),e._v(" "),n("p",[n("img",{attrs:{src:s(474),alt:""}})]),e._v(" "),n("p",[e._v("To summarize, all of these combinations have the following characteristics in common:")]),e._v(" "),n("p",[e._v("• Perform vector-ized operation using the SIMD hardware")]),e._v(" "),n("p",[e._v("• Use multiple compute processors in conjunction with a processor for control")]),e._v(" "),n("p",[e._v("• The systems can multi-task")]),e._v(" "),n("p",[e._v("However, each combination requires its own unique method for software development.")]),e._v(" "),n("p",[e._v("This can prove to be inconvenient, since software development and related services must be rebuilt ground up every time a new platform hits the market. The software developers must learn a new set of APIs and languages. Often times, the acquired skills might quickly become outdated, and thus prove to be useless. This is especially more common in heterogeneous platforms, as programming methods can be quite distinct from each other. Also, there may be varying difficulty in the software development process, which may prevent the platform to be chosen solely on its hardware capabilities.")]),e._v(" "),n("p",[e._v('The answer to this problem is "OpenCL".')])])}),[],!1,null,null,null);t.default=a.exports}}]);
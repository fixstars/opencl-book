# Historical Background

## _Multi-core + Heterogeneous Systems_

In recent years, more and more sequential solutions are being replaced with multi-core solutions. The physical limitation has caused the processor capability to level off, so the effort is naturally being placed to use multiple processors in parallel. The heterogeneous system such as the CPU+GPU system is becoming more common as well.

The GPU is a processor designed for graphics processing, but its parallel architecture containing up to hundreds of cores makes it suited for data parallel processes. The GPGPU (General Purpose GPU), which uses the GPU for tasks other than graphics processing, has been attracting attention as a result3. NVIDIA's CUDA has made the programming much simpler, as it allows the CPU for performing general tasks and the GPU for data parallel tasks4. NVIDIA makes GPUs for graphics processing, as well as GPUs specialized for GPGPU called "Tesla".

**Figure 2.1** shows an example of a heterogeneous system using a GPU as an accelerator. The chip that was used in PLAYSTATION3 called the CELL/B.E. is made up of 2 different types of cores, called PPE and SPE. This is an example of a heterogeneous environment contained in one chip. A similar chip is the ARM SoC (System on Chip) used in cell phones and tablet PCs, which contains different cores on a chip.

## _Vendor-dependent Development Environment_

We will now take a look at software development in a heterogeneous environment.

First, we will take a look at CUDA, which is a way to write generic code to be run on the GPU. Since no OS is running on the GPU, the CPU must perform tasks such as code execution, file system management, and the user interface, so that the data parallel computations can be performed on the GPU.

In CUDA, the control management side (CPU) is called the "host", and the data parallel side (GPU) is called the "device". The CPU side program is called the host program, and the GPU side program is called the kernel. The main difference between CUDA and the normal development process is that the kernel must be written in the CUDA language, which is an extension of the C language. An example kernel code is shown in **List 2.1**.

**List 2.1: Example Kernel Code**

> 001: \_\_global\_\_ void vecAdd(float \*A, float \*B, float \*C) /\* Code to be executed on the GPU (kernel) \*/
>
> 002: {
>
> 003: int tid = threadIdx.x; /\* Get thread ID \*/
>
> 004:
>
> 005: C\[tid] = A\[tid] + B\[tid];
>
> 006:
>
> 007: return;
>
> 008: }

The kernel is called from the CPU-side, as shown in **List 2.2**5.

> 001: int main(void) /\* Code to be ran on the CPU \*/
>
> 002: {
>
> 003: …
>
> 004: vecAdd<<<1, 256>>>(dA, dB, dC); /\* kernel call（256 threads） \*/
>
> 005: …
>
> 006: }

The Cell/B.E. is programmed using the "Cell SDK" released by IBM6. The Cell/B.E. comprises of a PPE for control, and 8 SPEs for computations, each requiring specific compilers. Although it does not extend a language like the CUDA, the SPE must be controlled by the PPE, using specific library functions provided by the Cell SDK. Similarly, specific library functions are required in order to run, for example, SIMD instructions on the SPE.

You may have noticed that the structures of the two heterogeneous systems are same, with the control being done on the CPU/PPE, and the computation being performed on GPU/SPE. However, the programmers must learn two distinct sets of APIs. (**Table 2.1**)

**Table 2.1: Example Cell/B.E. API commands**

|       Function       |            API           |
| :------------------: | :----------------------: |
|   Open SPE program   |    spe\_image\_open()    |
|  Create SPE context  |  spe\_context\_create()  |
|   Load SPE program   |   spe\_context\_load()   |
| Execute SPE program  |   spe\_context\_run()    |
|  Delete SPE context  | spe\_context\_destroy()  |
|  Close SPE program   |   spe\_image\_close()    |

In order to run the same instruction on different processors, the programmer is required to learn processor-specific instructions. As an example, in order to perform a SIMD instruction, x86, PPE, SPE must call a SSE instruction, a VMX instruction, and a SPE-embedded instruction, respectively. (**Table 2.2**)

**Table 2.2: SIMD ADD instructions on different processors**

|    X86 (SSE3)    | PowerPC (PPE)  |     SPE     |
| :--------------: | :------------: | :---------: |
| \_mm\_add\_ps()  |   vec\_add()   | spu\_add()  |

Additionally, in the embedded electronics field, a similar model is used, where the CPU manages the DSPs suited for signal processing. Even here, the same sort of procedure is performed, using a completely different set of APIs.

**Figure 2.2: Combination example of controlling and arithmetic**

![](<../.gitbook/assets/Screen_Shot_2021-12-21_at_10.01.19_PM.png>)

To summarize, all of these combinations have the following characteristics in common:

• Perform vector-ized operation using the SIMD hardware

• Use multiple compute processors in conjunction with a processor for control

• The systems can multi-task

However, each combination requires its own unique method for software development.

This can prove to be inconvenient, since software development and related services must be rebuilt ground up every time a new platform hits the market. The software developers must learn a new set of APIs and languages. Often times, the acquired skills might quickly become outdated, and thus prove to be useless. This is especially more common in heterogeneous platforms, as programming methods can be quite distinct from each other. Also, there may be varying difficulty in the software development process, which may prevent the platform to be chosen solely on its hardware capabilities.

The answer to this problem is "OpenCL".

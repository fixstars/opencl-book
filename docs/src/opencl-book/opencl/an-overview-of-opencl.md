# An Overview of OpenCL

OpenCL is a framework that allows a standardized coding method independent of processor types or vendors. In particular, the following two specifications are standardized:&#x20;

**1. OpenCL C Language Specification**&#x20;

Extended version of C to allow parallel programming&#x20;

**2. OpenCL Runtime API Specification**&#x20;

API used by the control node to send tasks to the compute cores

By using the OpenCL framework, software developers will be able to write parallel code that is independent of the hardware platform.&#x20;

The heterogeneous model, made up of a control processor and multiple compute processors, is currently being employed in almost all areas, including HPC, Desktops and embedded systems. OpenCL will allow all of these areas to be taken care of.&#x20;

As an example, if an OpenCL implementation includes support for both multi-core CPU and GPU, a CPU core can use the other cores that include SSE units, as well as all the GPU to perform computations in parallel7. Furthermore, everything can be written using OpenCL.&#x20;

### _OpenCL Software Framework_&#x20;

So what exactly is meant by "using OpenCL"? When developing software using OpenCL, the following two tools are required:&#x20;

• OpenCL Compiler&#x20;

• OpenCL Runtime Library&#x20;

The programmer writes the source code that can be executed on the device using the OpenCL C language. In order to actually execute the code, it must first be compiled to a binary using the OpenCL Compiler designed for that particular environment.&#x20;

Once the code is compiled, it must then be executed on the device. This execution, which includes the loading of the binary and memory allocation, can be managed by the controlling processor. The execution process is common to all heterogeneous combinations. This process must be coded by the programmer.

**Figure 2.3: Application example of OpenCL for CPU and GPU (CUDA) envir** &#x20;

![](<../.gitbook/assets/Screen Shot 2021-12-23 at 9.37.37 AM.png>)

The control processer is assumed to have a C/C++ compiler installed, so the execution process can be written in normal C/C++. The set of commands that can be used for this task is what is contained in the "OpenCL Runtime Library," which is designed to be used for that particular environment9.&#x20;

The OpenCL Runtime Library Specification also requires a function to compile the code to be run on the device. Therefore, all tasks ranging from compiling to executing can be written within the control code, requiring only this code to be compiled and run manually.&#x20;

### _Performance_&#x20;

OpenCL is a framework that allows for common programming in any heterogeneous environment. Therefore, OpenCL code is capable of being executed on any computer. This brings up the question of whether performance is compromised, as it is often the case for this type of common language and middleware. If the performance suffers significantly as a result of using OpenCL, its purpose becomes questionable.&#x20;

OpenCL provides standardized APIs that perform tasks such as vectorized SIMD operations, data parallel processing, task parallel processing, and memory transfers. However, the abstraction layer is relatively close to the hardware, minimizing the overhead from the usage of OpenCL. In case lower-level programming is desired, OpenCL does allow the kernel to be written in its native language using its own API. This seems to somewhat destroy the purpose of OpenCL, as it would make the code non-portable. However, OpenCL prioritizes maximizing performance of a device rather than its portability. One of the functions that the OpenCL runtime library must support is the ability to determine the device type, which can be used to select the device to be used in order to run the OpenCL binary.

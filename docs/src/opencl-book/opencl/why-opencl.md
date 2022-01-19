---
description: This section will discuss the advantage of developing software using OpenCL.
---

# Why OpenCL?

### _Standardized Parallelization API_&#x20;

As mentioned previously, each heterogeneous system requires its own unique API/programming method. The aforementioned CUDA and Cell SDK are such examples. As far as standardized tools, Unix POSIX threads, OpenMP for shared memory systems, and MPI for distributed memory type systems exist. OpenCL is another standardized tool, but contrary to the other tools, it is independent of processors, operating systems, and memory types. By learning OpenCL, software developers will be able to code in any parallel environment. It is, however, necessary for these processors to support OpenCL, requiring the OpenCL compiler and the runtime library to be implemented. That being said, there are many reputable groups working on the standardization of OpenCL, making the switch over likely to be just a matter of time.&#x20;

### _Optimization_&#x20;

OpenCL provides standard APIs at a level close to the hardware. To be specific, these include SIMD vector operations, asynchronous memory copy using DMA, and memory transfer between the processors. Since high abstraction is not used, it is possible to tune the performance to get the most out of the compute processors of choice using OpenCL.&#x20;

As mentioned earlier, OpenCL allows for the use of the processor-specific API to be used in case some specific functions are not supported in OpenCL. Therefore, the use of OpenCL would never result in limiting the performance.&#x20;

This may seem counter-intuitive, since in order to maximize performance, it is necessary to learn the hardware-dependent methods. However, it should be kept in mind that if some code is written in OpenCL, it should work in any environment. Using the hardware-dependent coding method, the main steps taken is coding, debugging, and then tuning. If the code is already debugged and ready in OpenCL, the developer can start directly from the tuning step. Anyone who has developed code in these types of environment should see the benefit in this, since this would reduce the chance of wasting time on bugs that may arise from not having a full understanding of the hardware.&#x20;

### _Learning Curve_&#x20;

OpenCL C language, as the name suggests, uses almost the exact same syntax as the C language. It is extended to support SIMD vector operations and multiple memory hierarchies, and some features not required for computations, such as fopen(), were taken out. (OpenCL 1.0 did not support printf(), but this is supported in OpenCL 1.2)&#x20;

The control program using the OpenCL runtime API can be written in C or C++, and does not require a special compiler. The developer is required to learn how to use the OpenCL runtime API, but this is not very difficult, especially to those who have experience with developing in heterogeneous environment such as CUDA. Also, once this is written to control one device type, the code will not have to be changed in order to control another device.&#x20;

****

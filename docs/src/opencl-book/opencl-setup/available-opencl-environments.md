---
description: >-
  This section will introduce the available OpenCL environment as of January,
  2012.
---

# Available OpenCL Environments

## _Intel OpenCL_

Intel provides the "Intel OpenCL SDK" for programming its multi-core CPU. Both Windows and Linux are supported, and the latest version (Intel OpenCL SDK 1.5) supports OpenCL 1.1.

The prerequisite to use this SDK is that the CPU supports either SSE 4.1 and above, or AVX. **Table 3.1** lists the supported CPUs, as well as the OS that we have tested on.

**Table 3.1: Intel OpenCL SDK enabled hardware and OS**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_8.59.34_PM.png>)

For more information, visit the Intel website: [http://software.intel.com/en-us/articles/vcsource-tools-opencl-sdk](http://software.intel.com/en-us/articles/vcsource-tools-opencl-sdk)

## _NVIDIA OpenCL_

NVIDIA has released their OpenCL 1.1 implementation for their GPU (**Table 3.2**). NVIDIA also has a GPGPU development environment known as CUDA, which is a parallel computing platform and programming model. "C for CUDA" and "OpenCL" are the languages accepted for using CUDA. Therefore, the OpenCL environment is included as part of their CUDA environment.

**Table 3.2: NVIDIA OpenCL enabled hardware and OS**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.00.45_PM.png>)

The latest CUDA-enabled graphics boards are listed on NVIDIA's website:

Hardware: [http://www.nvidia.com/object/cuda\_learn\_products.html](http://www.nvidia.com/object/cuda\_learn\_products.html)

Supported OS: [http://developer.nvidia.com/](http://developer.nvidia.com/)

## _AMD (ATI) OpenCL_

ATI used to be a reputable graphic-chip vendor like NVIDIA, but was bought out by AMD in 2006. Some graphics products from AMD still have the ATI brand name.

AMD had released a GPGPU development environment called "ATI Stream SDK", but this is now called "AMD APP (Accelerated Parallel Programming) SDK". AMD's OpenCL environment supports both multi-core x86 CPU, as well as their graphics boards (**Table 3.3**).

Their latest release, which is "AMD APP SDK v2.6" supports OpenCL 1.1. They also have a preview release for OpenCL 1.2, which can be used by installing "8.93.10 preview drivers".

**Table 3.3: AMD APP SDK enabled hardware and OS**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.02.42_PM.png>)

For more information, visit AMD's website: [http://developer.amd.com/sdks/AMDAPPSDK/pages/DriverCompatibility.aspx](http://developer.amd.com/sdks/AMDAPPSDK/pages/DriverCompatibility.aspx)

## _Apple OpenCL_

One of the main features included in MacOS X 10.6 (Snow Leopard) was the Apple OpenCL, which was the first world-wide OpenCL release (**Figure 3.4**). The default support of OpenCL in the operating system, which allows developers the access to OpenCL at their fingertips, may help spread the use of OpenCL as a means to accelerate programs via GPGPU. Xcode, which is Apple's development environment, must be installed prior to the use of OpenCL

**Table 3.4: Apple OpenCL enabled hardware and OS**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.03.48_PM.png>)

Apple's OpenCL compiler supports both GPUs and x86 CPUs.

## _IBM OpenCL_

IBM has released a version of OpenCL Development Kit for their BladeCenter QS22 and JS23, which can be downloaded from IBM Alpha Works: [http://www.alphaworks.ibm.com/tech/opencl/](http://www.alphaworks.ibm.com/tech/opencl/)

QS22 is a blade server featuring two IBM PowerXCell 8i processors, offering five times the double precision performance of the previous Cell/B.E. processor. JS23 is another blade server, made up of two POWER6+ processors, which is IBM's traditional RISC processor.

IBM's OpenCL includes compilers for both POWER processors, as well as for Cell/B.E (**Table 3.5**). Their latest release is OpenCL 1.1 conformant.

**Table 3.5: IBM OpenCL enabled hardware and OS**

![](<../.gitbook/assets/Screen_Shot_2022-01-02_at_9.04.49_PM.png>)

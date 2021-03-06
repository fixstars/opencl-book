---
description: >-
  The previous chapter discussed the basics of parallel processing. This chapter
  will introduce the main concepts of OpenCL.
---

# What is OpenCL?

To put it simply, OpenCL (Open Computing Language) is "a framework suited for parallel programming of heterogeneous systems". The framework includes the OpenCL C language as well as the compiler and the runtime environment required to run the code written in OpenCL C.

In recent years, it is no longer uncommon for laptops to be equipped with relatively high-end GPUs. For desktops, it is possible to have multiple GPUs due to PCIe slots becoming more common. OpenCL provides an effective way to program these CPU + GPU type heterogeneous systems. OpenCL, however, is not limited to heterogeneous systems, and it can be used on homogeneous, multi-core processors such as the Intel Core i7, by using one core for control and the other cores for computations.

**Figure 2.1: Example of a heterogeneous system**

****

![](<../.gitbook/assets/Screen_Shot_2021-12-21_at_9.50.26_PM.png>)

OpenCL is standardized by the Khronos Group, who is known for their management of the OpenGL specification. The group consists of members from companies like AMD, Apple, IBM, Intel, NVIDIA, Texas Instruments, Sony, Toshiba, which are all well-known processor vendors and/or multi-core software vendors. The goal of the standardization is ultimately to be able to program any combination of processors, such as CPU, GPU, Cell/B.E., DSP, etc. using one language. The company authoring this book, the Fixstars Corporation, is also a part of the standardization group, and **** involved in the specification process.

This chapter will give a glimpse into the history of how OpenCL came about, as well as an overview of what OpenCL is.
